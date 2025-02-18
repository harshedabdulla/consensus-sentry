use candid::{CandidType, Decode, Encode, Principal};
use ic_cdk::api::management_canister::http_request::{
    CanisterHttpRequestArgument, HttpHeader, HttpMethod, http_request
};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{BoundedStorable, DefaultMemoryImpl, StableBTreeMap, Storable};
use serde::{Deserialize, Serialize};
use std::{borrow::Cow, cell::RefCell, collections::HashMap};

const MAX_STRING_SIZE: u32 = 512;
//const MAX_RULES: u32 = 50;
const MAX_VALUE_SIZE: u32 = 10_000;

#[derive(CandidType, Serialize, Deserialize, Clone, Eq, Ord, PartialEq, PartialOrd)]
pub struct BoundedString(String);

// impl BoundedString {
//     fn new(s: String) -> Self {
//         assert!(s.len() <= MAX_STRING_SIZE as usize);
//         Self(s)
//     }
// }

impl Storable for BoundedString {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Decode!(bytes.as_ref(), String).unwrap())
    }
}

impl BoundedStorable for BoundedString {
    const MAX_SIZE: u32 = MAX_STRING_SIZE;
    const IS_FIXED_SIZE: bool = false;
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub enum RuleStatus {
    Proposed,
    Voting,
    Approved,
    Rejected,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Rule {
    pub id: BoundedString,
    pub text: BoundedString,
    pub status: RuleStatus,
    pub votes: u32,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Guardrail {
    pub id: BoundedString,
    pub name: BoundedString,
    pub category: BoundedString,
    pub rules: Vec<Rule>,
    pub owner: Principal,
    pub created_at: u64,
}

impl Storable for Guardrail {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for Guardrail {
    const MAX_SIZE: u32 = MAX_VALUE_SIZE;
    const IS_FIXED_SIZE: bool = false;
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    static GUARDRAIL_STORE: RefCell<StableBTreeMap<BoundedString, Guardrail, VirtualMemory<DefaultMemoryImpl>>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );
}

#[ic_cdk::update]
fn create_guardrail(guardrail: Guardrail) -> Result<BoundedString, String> {
    let id = guardrail.id.clone();
    GUARDRAIL_STORE.with(|store| {
        store.borrow_mut().insert(id.clone(), guardrail);
        Ok(id)
    })
}

#[ic_cdk::update]
fn propose_rule(guardrail_id: BoundedString, rule: Rule) -> Result<BoundedString, String> {
    GUARDRAIL_STORE.with(|store| {
        let mut store = store.borrow_mut();
        if let Some(mut guardrail) = store.get(&guardrail_id) {
            guardrail.rules.push(rule.clone());
            store.insert(guardrail_id, guardrail);
            Ok(rule.id)
        } else {
            Err("Guardrail not found".to_string())
        }
    })
}

#[ic_cdk::query]
fn get_guardrail(id: BoundedString) -> Result<Guardrail, String> {
    GUARDRAIL_STORE.with(|store| {
        store
            .borrow()
            .get(&id)
            .ok_or_else(|| "Guardrail not found".to_string())
    })
}

#[ic_cdk::query]
fn get_all_gaurdrails() -> Vec<Guardrail> {
    GUARDRAIL_STORE.with(|store| {
        store.borrow()
            .iter()
            .map(|(_, guardrail)| guardrail)
            .collect()
    })
}

#[ic_cdk::query]
fn get_guardrails_by_owner() -> Vec<Guardrail> {
    let caller = ic_cdk::caller();
    GUARDRAIL_STORE.with(|store| {
        store.borrow()
            .iter()
            .filter(|(_, guardrail)| guardrail.owner == caller)
            .map(|(_, guardrail)| guardrail)
            .collect()
    })
}

#[derive(Serialize, Deserialize)]
struct ApiResponse(HashMap<String, String>);

#[ic_cdk::update]
async fn classify_prompt(text: String) -> Result<String, String> {
    let url = "https://toxic-classifier-api-936459055446.us-central1.run.app/predict";
    let request_headers = vec![HttpHeader {
        name: "Content-Type".to_string(),
        value: "application/json".to_string(),
    }];
    
    let request_body = serde_json::json!({ "text": text }).to_string().into_bytes();
    let request = CanisterHttpRequestArgument {
        url: url.to_string(),
        method: HttpMethod::POST,
        headers: request_headers,
        body: Some(request_body),
        max_response_bytes: None,
        transform: None,
    };

    match http_request(request, 100_000_000_000).await {
        Ok((response,)) => {
            let api_response: ApiResponse = serde_json::from_slice(&response.body)
                .map_err(|e| format!("Failed to parse API response: {}", e))?;
            let result = api_response
                .0
                .iter()
                .map(|(k, v)| format!("{}: {}", k, v))
                .collect::<Vec<_>>()
                .join(", ");
            Ok(result)
        }
        Err((code, msg)) => Err(format!("HTTP request failed: {} ({:?})", msg, code)),
    }
}

// Required export
ic_cdk::export_candid!();