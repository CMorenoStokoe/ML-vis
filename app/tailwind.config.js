/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'main': ['Roboto', 'sans-serif'],
                'display': ['Arima', 'cursive']
            },
            colors:{
                primary: {
                    hue : '#A5BECC',
                    shade : '#243A73'
                } ,
                accent: {
                    hue: '#7C3E66',
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
