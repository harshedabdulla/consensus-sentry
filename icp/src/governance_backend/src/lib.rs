// use ic_sns_governance::pb::v1::{ManageNeuron, Proposal, Governance, Vote};
// use ic_sns_governance::pb::v1::GetProposal;

// let manage_neuron = ManageNeuron {
//     neuron_id: Some(neuron_id),
//     command: Some(Command::MakeProposal(proposal)),
// };

// let result = ic_sns_governance::manage_neuron(governance_canister_id, manage_neuron);

// let vote_request = ManageNeuron {
//     neuron_id: Some(neuron_id),
//     command: Some(Command::RegisterVote(Vote {
//         proposal_id: Some(proposal_id),
//         vote: Vote::Yes, // Or Vote::No
//     })),
// };

// let vote_result = ic_sns_governance::manage_neuron(governance_canister_id, vote_request);

// //get_proposal_info api
// let proposal_status = ic_sns_governance::get_proposal_info(proposal_id);
// if proposal_status == ProposalStatus::Approved {
//     println!("Rule added to guardrail!");
// }

// //add the new rule
// let new_rule = GuardrailRule {
//     id: proposal_id,
//     description: proposal.description,
//     added_by: proposal.creator,
//     status: RuleStatus::Active,
// };
// rules_canister.store(new_rule);

use ic_cdk::export::Principal;
use ic_cdk::timer::TimerId;
use std::collections::HashMap;
use std::time::{SystemTime, Duration};

// Global voting period (e.g., 1 hour)
const VOTING_PERIOD: Duration = Duration::from_secs(3600);


struct RuleVote {
    votes: HashMap<Principal, bool>, // Stores voter choice
    start_time: SystemTime, // Voting start time
    timer: Option<TimerId>, // Timer to track voting end
}

static mut RULE_VOTES: HashMap<u64, RuleVote> = HashMap::new();
static mut RULE_RESULTS: HashMap<u64, bool> = HashMap::new();

#[ic_cdk::update]
fn submit_vote(voter: Principal, rule_id: u64, approved: bool) -> String {
    unsafe {
        // Check if voting has started for the rule
        let rule_entry = RULE_VOTES.entry(rule_id).or_insert_with(|| {
            let start_time = SystemTime::now();
            let timer = ic_cdk::timer::set_timer(VOTING_PERIOD, move || {
                process_votes(rule_id);
            });

            RuleVote { votes: HashMap::new(), start_time, timer: Some(timer) }
        });

        // Check if voting period is still active
        if rule_entry.start_time.elapsed().unwrap_or(Duration::ZERO) > VOTING_PERIOD {
            return "Voting period has ended for this rule.".to_string();
        }

        // Store vote
        rule_entry.votes.insert(voter, approved);
        "Vote submitted successfully.".to_string()
    }
}

fn process_votes(rule_id: u64) {
    unsafe {
        if let Some(rule_vote) = RULE_VOTES.get(&rule_id) {
            let mut yes_count = 0;
            let mut no_count = 0;

            for (_, approved) in &rule_vote.votes {
                if *approved {
                    yes_count += 1;
                } else {
                    no_count += 1;
                }
            }

            let approval = yes_count > no_count; // Majority vote decides

            // Send to SNS Governance
            let _ = ic_sns_governance::manage_neuron(GOVERNANCE_CANISTER_ID, ManageNeuron {
                neuron_id: Some(123), // Replace with voter's actual neuron ID
                command: Some(Command::RegisterVote(Vote {
                    proposal_id: Some(rule_id),
                    vote: if approval { Vote::Yes } else { Vote::No },
                })),
            });

            // Store SNS decision
            RULE_RESULTS.insert(rule_id, approval);
            ic_cdk::print(format!("Rule {} approved: {}", rule_id, approval));
        }
    }
}

#[ic_cdk::query]
fn get_rule_result(rule_id: u64) -> Option<bool> {
    unsafe { RULE_RESULTS.get(&rule_id).copied() }
}