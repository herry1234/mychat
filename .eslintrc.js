module.exports = {
    // "extends": ["prettier"],
    // "plugins": ["prettier"],
    // "rules": {
    //   "prettier/prettier": "error"
    // }
    "extends": "airbnb",
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "rules": {
        "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
        "react/require-default-props": [0],
        "react/no-unused-prop-types": [2, {
            "skipShapeProps": true
        }],
        "import/no-named-as-default": 0,
        "react/no-multi-comp": [0],
        "no-bitwise": [0],
        "indent": 0,
        "function-paren-newline": "always",
    },
};