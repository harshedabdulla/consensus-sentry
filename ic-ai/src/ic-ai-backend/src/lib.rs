use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ic_cdk_macros::update;

// We'll use a HashMap since the response categories can vary
#[derive(Serialize, Deserialize)]
struct ApiResponse(HashMap<String, String>);

#[update]
async fn classify_prompt(text: String) -> Result<String, String> {
    let url = "https://toxic-classifier-api-936459055446.us-central1.run.app/predict";
    let request_headers = vec![
        HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/json".to_string(),
        },
    ];
    
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
            
            // Convert the HashMap into a formatted string
            let result = api_response.0
                .iter()
                .map(|(k, v)| format!("{}: {}", k, v))
                .collect::<Vec<_>>()
                .join(", ");
            
            Ok(result)
        }
        Err((code, msg)) => Err(format!("HTTP request failed: {} ({:?})", msg, code)),
    }
}