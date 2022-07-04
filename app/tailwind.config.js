/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'main': ['Roboto', 'sans-serif'],
                'display': ['Asap', 'sans-serif']
            },
            colors:{
                primary: {
                    hue : '#d7edf9',
                    shade : '#1f2a44'
                } ,
                accent: {
                    hue: '#7c3e58',
                }
            }
        },
    },
    plugins: [],
    safelist: [{ // tw only adds classes explicitly stated in code (ignoring dynamic classes)
        pattern: /(bg|text|border)-(primary|secondary|accent)-(hue|tint|tone|shade)/,
        variants: ['hover']
    }]
}
