export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        quicksand: ["Quicksand", "sans-serif"]
      },
      colors: {
        main: "#202124"
      },
      borderRadius: {
        xl: "1.5rem",
        "2xl": "2rem"
      }
    }
  },
  plugins: []
}
