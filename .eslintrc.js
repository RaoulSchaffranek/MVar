module.exports = {
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'project': './tsconfig.json', // Required to have rules that rely on Types.
    'tsconfigRootDir': './'
  },
  'extends': [
    'plugin:@typescript-eslint/recommended', // Out of the box Typescript rules
    'standard' // Out of the box StandardJS rules
  ],
  'plugins': [
    '@typescript-eslint' // Let's us override rules below.
  ],
  'rules': {
    '@typescript-eslint/member-delimiter-style': ['error', { // Prevents us from using any delimiter for interface properties.
      'multiline': {
        'delimiter': 'none',
        'requireLast': false
      },
      'singleline': {
        'delimiter': 'comma',
        'requireLast': false
      }
    }],
    '@typescript-eslint/indent': 'off', // This is the job of StandardJS, they are competing rules so we turn off the Typescript one.
    'node/no-unsupported-features/es-syntax': 'off' ,// Allows us to use Import and Export keywords.
    '@typescript-eslint/no-non-null-assertion' : 'off', // Allows us to use null-assertions.
  }
}
