export default {
    app: {
        token: "b0464c8a93794f7cb7e9b40438e2012d", // <- enter your token here
        muted: false, // <- mute microphone by default
        googleIt: true // <- ask users to google their request, in case of input.unknown action
    },
    locale: {
        strings: {
            welcomeTitle: "Hello, I'm Keya. I'm here to assist you. ",
            welcomeDescription: `You can type "Hello" for example. Or just press on the microphone to talk`,
            offlineTitle: "Oh, no!",
            offlineDescription: "It looks like you are not connected to the internet, this webpage requires internet connection, to process your requests",
            queryTitle: "Ask me something...",
            voiceTitle: "Go ahead, im listening..."
        },
        settings: {
            speechLang: "hi-IN", // <- output language
            recognitionLang: "hi-IN" // <- input(recognition) language
        }
    }
}