export const idlFactory = ({ IDL }) => {
  const RuleStatus = IDL.Variant({
    'Proposed' : IDL.Null,
    'Voting' : IDL.Null,
    'Approved' : IDL.Null,
    'Rejected' : IDL.Null
  });
  const Rule = IDL.Record({
    'id' : IDL.Text,
    'text' : IDL.Text,
    'status' : RuleStatus,
    'votes' : IDL.Nat32
  });
  const Guardrail = IDL.Record({
    'id' : IDL.Text,
    'name' : IDL.Text,
    'category' : IDL.Text,
    'rules' : IDL.Vec(Rule),
    'owner' : IDL.Principal,
    'created_at' : IDL.Nat64
  });
  return IDL.Service({
    'create_guardrail' : IDL.Func(
        [Guardrail],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        []
      ),
    'propose_rule' : IDL.Func(
        [IDL.Text, Rule],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        []
      ),
    'get_guardrail' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : Guardrail, 'Err' : IDL.Text })],
        ['query']
      ),
    'get_guardrails_by_owner' : IDL.Func(
        [],
        [IDL.Vec(Guardrail)],
        ['query']
      ),
    'classify_prompt' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        []
      ),
    'get_all_gaurdrails' : IDL.Func(
        [],
        [IDL.Vec(Guardrail)],
        ['query']
      ),
  });
};