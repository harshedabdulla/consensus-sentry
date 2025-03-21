use candid::Principal;
use ic_cdk_timers::TimerId;
use std::collections::HashMap;
use std::process::Command;
use std::time::{SystemTime, Duration};
use std::sync::Once;
use serde::{Serialize, Deserialize};
use serde_json::Value;
use std::fs;
use std::cell::RefCell;
use candid::CandidType;

// Global voting period (e.g., 1 hour)
const VOTING_PERIOD: Duration = Duration::from_secs(3600);

// Path for temporary files
const TEMP_PATH: &str = "/tmp/quill_voting/";
const TOKEN_SYMBOL: &str = "ctr";
const MIN_STAKE: f64 = 1.0;

// Initialize once
static INIT: Once = Once::new();

// Structure for vote data to be sent to quill
#[derive(Serialize, Deserialize)]
struct VoteData {
    neuron_id: String,
    proposal_id: u64,
    vote: bool, // true for yes, false for no
}

#[derive(Clone)]
struct RuleVote {
    votes: HashMap<Principal, bool>, // Stores voter choice
    start_time: SystemTime, // Voting start time
    timer: Option<TimerId>, // Timer to track voting end
    neuron_ids: HashMap<Principal, String>, // Maps voter to their neuron ID
    stakes: HashMap<Principal, u64>, // Maps voter to their stake amount
}

#[derive(Serialize, Deserialize, Clone)]
struct NeuronData {
    neuron_id: String,
    controller: Principal,
    stake_amount: u64,
    created_at: u64,
}

// Frontend request for creating a neuron
#[derive(Serialize, Deserialize, CandidType)]
struct RequestCreateNeuron {
    principal_id: Principal,
    stake_amount: f64,
    dissolve_delay_seconds: u64,
}

#[derive(Serialize, Deserialize, CandidType)]
struct ApiResponse<T> {
    success: bool,
    message: String,
    data: Option<T>,
}

#[derive(Serialize, Deserialize)]
struct StakeNeuronResponse {
    neuron_id: String
}

#[derive(Serialize, Deserialize, CandidType)]
struct VoteRequest {
    principal_id: Principal,
    proposal_id: u64,
    vote: bool, 
}

#[derive(Serialize, Deserialize)]
struct VotingConfig {
    token_name: String,
    token_symbol: String,
    proposal_voting_threshold: f64,
    neurons_min_stake: u64,
}

static mut CONFIG: Option<VotingConfig> = None;

thread_local! {
    static RULE_VOTES: RefCell<HashMap<u64, RuleVote>> = RefCell::new(HashMap::new());
    static RULE_RESULTS: RefCell<HashMap<u64, bool>> = RefCell::new(HashMap::new());
    static REGISTERED_NEURONS: RefCell<HashMap<Principal, NeuronData>> = RefCell::new(HashMap::new());
}

// Initialize configuration
fn init_config() {
    unsafe {
        CONFIG = Some(VotingConfig {
            token_name: "Centry".to_string(),
            token_symbol: "ctr".to_string(),
            proposal_voting_threshold: 0.51, 
            neurons_min_stake: 1,            
        });
    }
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

// Parse neuron ID from JSON response
fn parse_neuron_id_from_response(response: &str) -> Result<String, String> {
    let parsed: Result<StakeNeuronResponse, serde_json::Error> = serde_json::from_str(response);
    
    match parsed {
        Ok(data) => Ok(data.neuron_id),
        Err(e) => {
            // Fallback parsing if the expected structure doesn't match
            match serde_json::from_str::<Value>(response) {
                Ok(v) => {
                    if let Some(id) = v.get("neuron_id").and_then(|id| id.as_str()) {
                        Ok(id.to_string())
                    } else if let Some(id) = v.get("id").and_then(|id| id.as_str()) {
                        Ok(id.to_string())
                    } else {
                        Err(format!("Could not find neuron ID in response: {}", response))
                    }
                },
                Err(_) => Err(format!("Invalid JSON response: {}", e))
            }
        }
    }
}

// Create neuron for voter
#[ic_cdk::update]
fn create_neuron(request: RequestCreateNeuron) -> ApiResponse<String> {
    // Initialize if needed

        INIT.call_once(|| {
            init_temp_dir();
            init_config();
        });


    // Parse the principal ID from the request
    let caller = request.principal_id;
    let amount = request.stake_amount;
    let dissolve_delay_seconds = request.dissolve_delay_seconds;

    // Validate minimum stake
    if amount < MIN_STAKE {
        return ApiResponse {
            success: false,
            message: format!(
                "Stake amount must be at least {} {}",
                MIN_STAKE,
                TOKEN_SYMBOL
            ),
            data: None,
        };
    }

    // Validate dissolve delay (minimum 6 months for voting)
    let min_dissolve_delay = 6 * 30 * 24 * 60 * 60; // Approximately 6 months in seconds
    if dissolve_delay_seconds < min_dissolve_delay {
        return ApiResponse {
            success: false,
            message: format!(
                "Dissolve delay must be at least 6 months ({} seconds)",
                min_dissolve_delay
            ),
            data: None,
        };
    }

    // Create a file for the stake neuron message
    let stake_file = format!("{}{}_stake_neuron.json", TEMP_PATH, caller.to_string());
    
    // Generate the stake neuron message
    let stake_result = execute_quill(&[
        "stake-neuron",
        "--amount", &amount.to_string(),
        "--controller", &caller.to_string(),
        ">", &stake_file
    ]);

    if let Err(e) = stake_result {
        return ApiResponse {
            success: false,
            message: e,
            data: None,
        };
    }

    // Send the stake neuron message
    let stake_send_result = execute_quill(&["send", &stake_file]);
    
    // Clean up stake file
    let _ = fs::remove_file(&stake_file);
    
    if let Err(e) = stake_send_result {
        return ApiResponse {
            success: false,
            message: e,
            data: None,
        };
    }

    // Parse the JSON response to get the neuron ID
    let response = stake_send_result.unwrap();
    let neuron_id = match parse_neuron_id_from_response(&response) {
        Ok(id) => id,
        Err(e) => return ApiResponse {
            success: false,
            message: format!("Failed to parse neuron ID: {}", e),
            data: None,
        },
    };

    // Set the dissolve delay
    let dissolve_file = format!("{}{}_dissolve_delay.json", TEMP_PATH, neuron_id);
    
    let dissolve_result = execute_quill(&[
        "increase-dissolve-delay",
        "--neuron-id", &neuron_id,
        "--dissolve-delay", &dissolve_delay_seconds.to_string(),
        ">", &dissolve_file
    ]);

    if let Err(e) = dissolve_result {
        return ApiResponse {
            success: false,
            message: e,
            data: None,
        };
    }

    // Send the dissolve delay message
    let dissolve_send_result = execute_quill(&["send", &dissolve_file]);
    
    // Clean up dissolve file
    let _ = fs::remove_file(&dissolve_file);
    
    if let Err(e) = dissolve_send_result {
        return ApiResponse {
            success: false,
            message: e,
            data: None,
        };
    }

    // Store the neuron data in our registry
    REGISTERED_NEURONS.with(|neurons| {
        neurons.borrow_mut().insert(
            caller,
            NeuronData {
                neuron_id: neuron_id.clone(),
                controller: caller,
                stake_amount: amount as u64,
                created_at: SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_secs(),
            }
        );
    });

    ApiResponse {
        success: true,
        message: "Neuron created successfully".to_string(),
        data: Some(neuron_id),
    }
}


// Get neuron stake using quill
fn get_neuron_stake(neuron_id: &str) -> Result<u64, String> {
    // Create a temporary file for the neuron info message
    let file_name = format!("{}{}_info.json", TEMP_PATH, neuron_id);
    
    // Create neuron info message
    let info_result = execute_quill(&[
        "neuron-info",
        "--neuron-id", neuron_id,
        ">", &file_name
    ]);

    if info_result.is_err() {
        return Err(info_result.err().unwrap());
    }

    // Send the message to get neuron info
    let send_result = execute_quill(&["send", &file_name]);
    
    // Clean up temp file
    let _ = fs::remove_file(&file_name);
    
    if send_result.is_err() {
        return Err(send_result.err().unwrap());
    }
        
    // Check if we have this neuron in our REGISTERED_NEURONS
    let result = REGISTERED_NEURONS.with(|neurons| {
        for (_, neuron_data) in neurons.borrow().iter() {
            if neuron_data.neuron_id == neuron_id {
                return Some(neuron_data.stake_amount);
            }
        }
        None
    });

    if let Some(stake) = result {
        return Ok(stake);
    }
    
    // If not in registry, simulate extraction from Quill response
    // This is a placeholder for actual JSON parsing
    let response = send_result.unwrap();
    
    if response.contains("stake") {
        // Simulating extraction of stake value
        Ok(2) // Simulated 2 CTR stake
    } else {
        Err("Could not find stake information in neuron data".to_string())
    }
}

#[ic_cdk::update]
fn submit_vote(request: VoteRequest) -> ApiResponse<String> {
    // Parse the principal ID from the request
    let voter = request.principal_id;
    let rule_id = request.proposal_id;
    let approved = request.vote;

    // Initialize if needed
    INIT.call_once(|| {
        init_temp_dir();
        init_config();
    });

    // Check if the voter has a registered neuron
    if !has_registered_neuron(voter) {
        return ApiResponse {
            success: false,
            message: "You must create a neuron before voting. Use the create_neuron function first.".to_string(),
            data: None,
        };
    }
    
    // Get the voter's neuron ID
    let neuron_id = match get_voter_neuron_id(voter) {
        Some(id) => id,
        None => return ApiResponse {
            success: false,
            message: "Could not find your neuron ID. Please create a neuron first.".to_string(),
            data: None,
        },
    };
    
    // Get the voter's stake
    let stake = match get_neuron_stake(&neuron_id) {
        Ok(amount) => amount,
        Err(e) => return ApiResponse {
            success: false,
            message: format!("Failed to verify stake: {}", e),
            data: None,
        },
    };
    
    // // Check minimum stake requirement
    // let min_stake = CONFIG.as_ref().unwrap().neurons_min_stake;
    // if stake < min_stake {
    //     return ApiResponse {
    //         success: false,
    //         message: format!(
    //             "Insufficient stake. Minimum required: {} {}", 
    //             min_stake, 
    //             CONFIG.as_ref().unwrap().token_symbol
    //         ),
    //         data: None,
    //     };
    // }
    
    // Check if voting has started for the rule
    let rule_id_clone = rule_id;
    let voter_clone = voter;
    let approved_clone = approved;
    let neuron_id_clone = neuron_id;
    let stake_clone = stake;

    RULE_VOTES.with(|votes| {
        let mut votes = votes.borrow_mut();
        let entry = votes.entry(rule_id_clone).or_insert_with(|| {
            let start_time = SystemTime::now();
            let timer = ic_cdk_timers::set_timer(VOTING_PERIOD, move || {
                process_votes(rule_id_clone);
            });
            
            RuleVote { 
                votes: HashMap::new(), 
                start_time, 
                timer: Some(timer),
                neuron_ids: HashMap::new(),
                stakes: HashMap::new(),
            }
        });

        // Check if voting period is still active
        if entry.start_time.elapsed().unwrap_or(Duration::ZERO) > VOTING_PERIOD {
            return ApiResponse {
                success: false,
                message: "Voting period has ended for this rule.".to_string(),
                data: None,
            };
        }

        // Store vote, neuron ID, and stake
        entry.votes.insert(voter_clone, approved_clone);
        entry.neuron_ids.insert(voter_clone, neuron_id_clone);
        entry.stakes.insert(voter_clone, stake_clone);
        
        ApiResponse {
            success: true,
            message: "Vote submitted successfully.".to_string(),
            data: None,
        }
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

// Check if a voter has a registered neuron
fn has_registered_neuron(voter: Principal) -> bool {
    REGISTERED_NEURONS.with(|neurons| {
        neurons.borrow().contains_key(&voter)
    })
}

// Get voter's neuron ID
fn get_voter_neuron_id(voter: Principal) -> Option<String> {
    REGISTERED_NEURONS.with(|neurons| {
        neurons.borrow().get(&voter).map(|data| data.neuron_id.clone())
    })
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

// Get a voter's neuron information
#[ic_cdk::query]
fn get_voter_neuron_info(voter: Principal) -> String {
    REGISTERED_NEURONS.with(|neurons| {
        if let Some(neuron_data) = neurons.borrow().get(&voter) {
            format!(
                "Neuron Information: \
                \nNeuron ID: {} \
                \nController: {} \
                \nStake Amount: {} {} \
                \nCreated At: {}",
                neuron_data.neuron_id,
                neuron_data.controller,
                neuron_data.stake_amount,
                TOKEN_SYMBOL,
                neuron_data.created_at
            )
        } else {
            "No neuron found for this voter.".to_string()
        }
    })
}

// List all registered neurons
#[ic_cdk::query]
fn list_registered_neurons() -> Vec<String> {
    REGISTERED_NEURONS.with(|neurons| {
        neurons.borrow()
            .iter()
            .map(|(principal, data)| {
                format!(
                    "Principal: {}, Neuron ID: {}, Stake: {}",
                    principal,
                    data.neuron_id,
                    data.stake_amount
                )
            })
            .collect()
    })
}


ic_cdk::export_candid!();