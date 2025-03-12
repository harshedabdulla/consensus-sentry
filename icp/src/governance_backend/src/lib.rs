// use ic_cdk::export::Principal;
// use ic_cdk::timer::TimerId;
// use std::collections::HashMap;
// use std::time::{SystemTime, Duration};
// use ic_sns_governance::pb::v1::{ManageNeuron, Command, Vote};
// use std::sync::Once;

// // Global voting period (e.g., 1 hour)
// const VOTING_PERIOD: Duration = Duration::from_secs(3600);

// static INIT: Once = Once::new();
// const SNS_GOVERNANCE_CANISTER_ID: Principal = Principal::from_text("a3shf-5eaaa-aaaaa-qaafa-cai").unwrap();


// // fn get_governance_canister_id() -> Principal {
// //     unsafe {
// //         INIT.call_once(|| {
// //             GOVERNANCE_CANISTER_ID = Some(Principal::from_text("a3shf-5eaaa-aaaaa-qaafa-cai").unwrap());
// //         });
// //         GOVERNANCE_CANISTER_ID.unwrap()
// //     }
// // }

// struct RuleVote {
//     votes: HashMap<Principal, bool>, // Stores voter choice
//     start_time: SystemTime, // Voting start time
//     timer: Option<TimerId>, // Timer to track voting end
// }

// static mut RULE_VOTES: HashMap<u64, RuleVote> = HashMap::new();
// static mut RULE_RESULTS: HashMap<u64, bool> = HashMap::new();

// #[ic_cdk::update]
// fn submit_vote(voter: Principal, rule_id: u64, approved: bool) -> String {
//     unsafe {
//         // Check if voting has started for the rule
//         let rule_entry = RULE_VOTES.entry(rule_id).or_insert_with(|| {
//             let start_time = SystemTime::now();
//             let timer = ic_cdk::timer::set_timer(VOTING_PERIOD, move || {
//                 process_votes(rule_id);
//             });

//             RuleVote { votes: HashMap::new(), start_time, timer: Some(timer) }
//         });

//         // Check if voting period is still active
//         if rule_entry.start_time.elapsed().unwrap_or(Duration::ZERO) > VOTING_PERIOD {
//             return "Voting period has ended for this rule.".to_string();
//         }

//         // Store vote
//         rule_entry.votes.insert(voter, approved);
//         "Vote submitted successfully.".to_string()
//     }
// }

// fn process_votes(rule_id: u64) {
//     unsafe {
//         if let Some(rule_vote) = RULE_VOTES.get(&rule_id) {
//             let mut yes_count = 0;
//             let mut no_count = 0;
//             let mut total_count = 0;

//             for (_, approved) in &rule_vote.votes {
//                 if *approved {
//                     yes_count += 1;
//                 } else {
//                     no_count += 1;
//                 }
//             }

//             total_count = yes_count+no_count;

//             let approval = yes_count > total_count/2; // Majority vote decides

//             // Send to SNS Governance
//             let _ = ic_sns_governance::manage_neuron(get_governance_canister_id(), ManageNeuron {
//                 neuron_id: Some(123), // Replace with voter's actual neuron ID
//                 command: Some(Command::RegisterVote(Vote {
//                     proposal_id: Some(rule_id),
//                     vote: if approval { Vote::Yes } else { Vote::No },
//                 })),
//             });

//             // Store SNS decision
//             RULE_RESULTS.insert(rule_id, approval);
//             ic_cdk::print(format!("Rule {} approved: {}", rule_id, approval));
//         }
//     }
// }

// #[ic_cdk::query]
// fn get_rule_result(rule_id: u64) -> Option<bool> {
//     unsafe { RULE_RESULTS.get(&rule_id).copied() }
// }

// ic_cdk::export_candid!();

use candid::Principal;
use ic_cdk_timers::TimerId;
use std::collections::HashMap;
use std::process::Command;
use std::time::{SystemTime, Duration};
use std::sync::Once;
use serde::{Serialize, Deserialize};
use std::fs;
use std::cell::RefCell;

// Global voting period (e.g., 1 hour)
const VOTING_PERIOD: Duration = Duration::from_secs(3600);

// Path for temporary files
const TEMP_PATH: &str = "/tmp/quill_voting/";

// Initialize once
static INIT: Once = Once::new();

// Structure for vote data to be sent to quill
#[derive(Serialize, Deserialize)]
struct VoteData {
    neuron_id: String,
    proposal_id: u64,
    vote: bool, // true for yes, false for no
}

struct RuleVote {
    votes: HashMap<Principal, bool>, // Stores voter choice
    start_time: SystemTime, // Voting start time
    timer: Option<TimerId>, // Timer to track voting end
    neuron_ids: HashMap<Principal, String>, // Maps voter to their neuron ID
}

thread_local! {
    static RULE_VOTES: RefCell<HashMap<u64, RuleVote>> = RefCell::new(HashMap::new());
    static RULE_RESULTS: RefCell<HashMap<u64, bool>> = RefCell::new(HashMap::new());
}

// Initialize the temp directory
fn init_temp_dir() {
    if !std::path::Path::new(TEMP_PATH).exists() {
        std::fs::create_dir_all(TEMP_PATH).expect("Failed to create temp directory");
    }
}

// Execute quill command and return result
fn execute_quill(args: &[&str]) -> Result<String, String> {
    let output = Command::new("quill")
        .args(args)
        .output()
        .map_err(|e| format!("Failed to execute quill: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(format!("Quill command failed: {}", String::from_utf8_lossy(&output.stderr)))
    }
}

// Register a vote using quill
fn register_vote_with_quill(neuron_id: &str, proposal_id: u64, approve: bool) -> Result<String, String> {
    // Create a unique file for this vote
    let file_name = format!("{}{}_{}_{}.json", TEMP_PATH, neuron_id, proposal_id, SystemTime::now().elapsed().unwrap_or(Duration::ZERO).as_secs());
    
    // Create vote message
    let vote_result = execute_quill(&[
        "register-vote",
        "--neuron-id", neuron_id,
        "--proposal-id", &proposal_id.to_string(),
        "--vote", if approve { "yes" } else { "no" },
        ">", &file_name
    ]);

    if vote_result.is_err() {
        return Err(vote_result.err().unwrap());
    }

    // Send the message
    let send_result = execute_quill(&["send", &file_name]);
    
    // Clean up temp file
    let _ = fs::remove_file(&file_name);
    
    send_result
}

#[ic_cdk::update]
fn submit_vote(voter: Principal, neuron_id: String, rule_id: u64, approved: bool) -> String {
    // Initialize if needed
    INIT.call_once(|| {
        init_temp_dir();
    });

    RULE_VOTES.with(|votes| {
        let mut votes = votes.borrow_mut();
        let rule_entry = votes.entry(rule_id).or_insert_with(|| {
            let start_time = SystemTime::now();
            let timer = ic_cdk_timers::set_timer(VOTING_PERIOD, move || {
                process_votes(rule_id);
            });
            
            RuleVote { 
                votes: HashMap::new(), 
                start_time, 
                timer: Some(timer),
                neuron_ids: HashMap::new(),
            }
        });

        // Check if voting period is still active
        if rule_entry.start_time.elapsed().unwrap_or(Duration::ZERO) > VOTING_PERIOD {
            return "Voting period has ended for this rule.".to_string();
        }

        // Store vote and neuron ID
        rule_entry.votes.insert(voter, approved);
        rule_entry.neuron_ids.insert(voter, neuron_id);
        
        "Vote submitted successfully.".to_string()
    })
}

fn process_votes(rule_id: u64) {
    RULE_VOTES.with(|votes| {
        let votes = votes.borrow();
        if let Some(rule_vote) = votes.get(&rule_id) {
            let mut yes_count = 0;
            let mut no_count = 0;
            
            for (voter, approved) in &rule_vote.votes {
                if *approved {
                    yes_count += 1;
                } else {
                    no_count += 1;
                }
            }
            
            let total_count = yes_count + no_count;
            let approval = yes_count > total_count / 2;
            
            if let Some((voter, _)) = rule_vote.votes.iter().next() {
                if let Some(neuron_id) = rule_vote.neuron_ids.get(voter) {
                    let _ = register_vote_with_quill(
                        neuron_id,
                        rule_id,
                        approval
                    );
                }
            }
            
            RULE_RESULTS.with(|results| {
                results.borrow_mut().insert(rule_id, approval);
            });
            
            ic_cdk::print(format!("Rule {} approved: {}", rule_id, approval));
        }
    });
}

#[ic_cdk::query]
fn get_rule_result(rule_id: u64) -> Option<bool> {
    RULE_RESULTS.with(|results| {
        results.borrow().get(&rule_id).copied()
    })
}

// Additional utility functions

#[ic_cdk::query]
fn get_voting_status(rule_id: u64) -> String {
    RULE_VOTES.with(|votes| {
        let votes = votes.borrow();
        if let Some(rule_vote) = votes.get(&rule_id) {
            let mut yes_count = 0;
            let mut no_count = 0;
            
            for (_, approved) in &rule_vote.votes {
                if *approved {
                    yes_count += 1;
                } else {
                    no_count += 1;
                }
            }
            
            let total_count = yes_count + no_count;
            let elapsed = rule_vote.start_time.elapsed().unwrap_or(Duration::ZERO);
            let remaining = if elapsed < VOTING_PERIOD {
                VOTING_PERIOD - elapsed
            } else {
                Duration::ZERO
            };
            
            format!(
                "Voting status: Yes: {}, No: {}, Total: {}, Time remaining: {} seconds",
                yes_count,
                no_count,
                total_count,
                remaining.as_secs()
            )
        } else {
            "No voting found for this rule ID.".to_string()
        }
    })
}


ic_cdk::export_candid!();