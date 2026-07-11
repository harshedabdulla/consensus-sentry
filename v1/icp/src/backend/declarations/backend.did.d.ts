import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type RuleStatus = { 'Proposed' : null } |
  { 'Voting' : null } |
  { 'Approved' : null } |
  { 'Rejected' : null };

export interface Rule {
  'id' : string,
  'text' : string,
  'status' : RuleStatus,
  'votes' : number
}

export interface Guardrail {
  'id' : string,
  'name' : string,
  'category' : string,
  'rules' : Array<Rule>,
  'owner' : Principal,
  'created_at' : bigint
}

export interface _SERVICE {
  'create_guardrail' : ActorMethod<[Guardrail], { 'Ok' : string } | { 'Err' : string }>,
  'propose_rule' : ActorMethod<[string, Rule], { 'Ok' : string } | { 'Err' : string }>,
  'get_guardrail' : ActorMethod<[string], { 'Ok' : Guardrail } | { 'Err' : string }>,
  'get_guardrails_by_owner' : ActorMethod<[], Array<Guardrail>>,
  'classify_prompt' : ActorMethod<[string], { 'Ok' : string } | { 'Err' : string }>,
  'get_all_gaurdrails' : ActorMethod<[], Array<Guardrail>>
}