<template>
<main id="app">

    <!-- The input -->
    <div class="query">
        <select @change="onChange($event)">
            <option v-for="(reason, key) in languages" 
                    :value="key"
                    :key="key">
            {{reason}}
            </option>
        </select>
        
        <div class="wrapper" v-if="micro == false">
            <i class="material-icons iicon" @click="microphone(true)">mic</i>
            <input :aria-label="config.locale.strings.queryTitle" autocomplete="off" v-model="translated" class="queryform" @keyup.enter="submit()" :placeholder="config.locale.strings.queryTitle" autofocus type="text">
            <i class="material-icons iicon t2s" @click="mute(true)" v-if="muted == false">volume_up</i>
            <i class="material-icons iicon t2s" @click="mute(false)" v-else>volume_off</i>
        </div>
        <div class="wrapper" v-else>
            <i class="material-icons iicon recording" @click="microphone(false)">mic</i><input class="queryform" :placeholder="speech" readonly>   
        </div>
    </div>

    <section class="wrapper ai-window">

        <br>
        <br>

        <!-- Display Welcome Message -->
        <div v-if="answers.length == 0 && online == true">
            <h1 class="title mdc-typography--headline">
                <br>
                <br>
                    {{config.locale.strings.welcomeTitle}}

                    <p class="mdc-typography--body2">{{config.locale.strings.welcomeDescription}}</p>
            </h1>
        </div>

        <!-- Display offline message -->
        <div v-if="answers.length == 0 && online == false">
            <h1 class="title mdc-typography--headline">
                <div class="material-icons up">cloud_off</div>
                <br>
                <br>
                    {{config.locale.strings.offlineTitle}}

                    <p class="mdc-typography--body2">{{config.locale.strings.offlineDescription}}</p>
            </h1>
        </div>

        <!-- Chat window -->
        <table v-for="a in answers" class="chat-window">
            <!-- Your messages -->
            <tr>
                <td class="bubble">{{a.result.resolvedQuery}}</td>
            </tr>

            <!-- Dialogflow messages -->
            <tr>
                <td>

                    <!-- Bot message types / Speech -->
                    <div v-if="a.result.fulfillment.speech" class="bubble bot">
                        {{a.result.fulfillment.speech}}
                    </div>

                </td>
            </tr>
        </table>

        <br>
        <p class="copyright" v-if="answers.length > 0">tab_over_spaces Smart India Hackathon 2019</p>
        <a id="bottom"></a>
    </section>
</main>
</template>

<style lang="sass">
@import url('https://fonts.googleapis.com/css?family=Roboto')
@import "App.sass"
</style>

<script>
import { ApiAiClient } from 'api-ai-javascript'
import config from './../config'
import axios from 'axios'
const client = new ApiAiClient({accessToken: config.app.token}) // <- replace it with yours

export default {
    name: 'app',

    data (){
        return {
            answers: [],
            query: '',
            speech: config.locale.strings.voiceTitle,
            micro: false,
            muted: config.app.muted,
            online: navigator.onLine,
            config,
            translated: '',
            speechLang : 'en-IN',
            languages: {
                "en-IN" : "English",
                "hi-IN": "हिन्दी",
                "gu-IN": "ગુજરાતી",
                "kn-IN": "ಕನ್ನಡ",
                "ml-IN": "മലയാളം",
                "mr-IN": "मराठी",
                "ta-IN": "தமிழ்",
                "te-IN": "తెలుగు",
                "ur-IN" : "بھارت",
                "bn-IN" : "বাংলা"
            }
        }
    },

    watch: {
        answers: function(val){
            setTimeout(() => { 
                document.querySelector('#bottom').scrollIntoView({ 
                    behavior: 'smooth' 
                })
            }, 2) // if new answers arrive, wait for render and then smoothly scroll down to #bottom selector, used as anchor
        }
    },
    methods: {
        submit(){

            client.textRequest(this.translated).then((response) => {
                console.log(response)
               
                 if(response.result.action == "input.unknown" && this.config.app.googleIt == true){
                    response.result.fulfillment.messages[0].unknown = true
                    response.result.fulfillment.messages[0].text = response.result.resolvedQuery
                } // if the googleIt is enabled, show the button
                response.result.resolvedQuery = this.query
                if(response.result.fulfillment.speech){
                    fetch('http://kotak-dialogflow-nodejs.herokuapp.com/google-translate-dialogflow-to-client', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json' },
                            body: JSON.stringify({
                            lang : this.speechLang,
                            message: response.result.fulfillment.messages["0"].speech
                        }),
                    }).then(res=>res.json())
                    .then(resp => {
                        console.log(resp.text)
                        response.result.fulfillment.speech = resp.text
                        this.speechUtterence = resp.text
                        this.handle(response) // <- handle the response in handle() method
                });

                }
                console.log(response)
                this.answers.push(response)
                
                this.translated = ''
                this.query = ''
                this.speech = '' // <- reset query and speech
            })
        },
    
        onChange(event) {
            this.speechLang = event.target.value
        },

        handle(response){
            
            if(response.result.fulfillment.speech || response.result.fulfillment.messages[0].type == 'simple_response'){
                console.log("The text is "+ response.result.fulfillment.speech)
                let speech = new SpeechSynthesisUtterance(response.result.fulfillment.speech || response.result.fulfillment.messages[0].textToSpeech)
                speech.voiceURI = 'native'
                speech.lang = 'hi'

                if(this.muted == false) window.speechSynthesis.speak(speech) // <- Speech output if microphone is allowed
            }
        },
        autosubmit(suggestion, translatedText){
            this.query = suggestion
            this.translated = translatedText
            this.submit()
        },
        mute(mode){
            this.muted = mode
        },
        microphone(mode){
            this.micro = mode
            let self = this // <- correct scope

            if(mode == true){
                let recognition = new webkitSpeechRecognition() // <- chrome speech recognition

                recognition.interimResults = true
                recognition.lang = this.speechLang
			    recognition.start()

                recognition.onresult = function(event){
			        for (var i = event.resultIndex; i < event.results.length; ++i){
			    	    self.speech = event.results[i][0].transcript
			        }
			    }

			    recognition.onend = function(){
				    recognition.stop()
                    self.micro = false
                    
                fetch('http://kotak-dialogflow-nodejs.herokuapp.com/google-translate-client-to-dialogflow', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: self.speech,
                        }),
                    }).then(res=>res.json())
                    .then(resp => {
                    self.autosubmit(self.speech, resp.text)
                });

                
			    }
            }
        }
    },

}
</script>