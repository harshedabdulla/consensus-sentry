export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({
    'Ok': IDL.Text,
    'Err': IDL.Text
  });

  return IDL.Service({
    'greet': IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'classify_prompt': IDL.Func([IDL.Text], [Result], ['update'])
  });
};

export const init = ({ IDL }) => { return []; };