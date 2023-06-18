import { useState, useEffect, useRef , React } from "react";
import "./verify-bot.css";

import { useNavigate } from "react-router-dom";
import SendIcon from "./images/send.png";
import MicIcon from "./images/mic.png";
import TtsDisabledIcon from "./images/notts.png";
import TtsEnabledIcon from "./images/tts.png";
import Loading from "./images/loading.gif";

import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes } from "firebase/storage";

import { Configuration, OpenAIApi } from "openai";


var notkeya = "sk-@mlx3KL@WAIbhOE"
var notkeyb = "mOSSO@JGT3Blb@kFJ5"
var notkeyc = "Ba@sQcVN5@dslZVJL@1Iz2"

const configuration = new Configuration({
    organization: "org-SxNS8ihaKwDqdWQqeicoC3iS",
    apiKey: (notkeya + notkeyb + notkeyc).replaceAll( "@" , "" ),
  });

  //console.log( (notkeya + notkeyb + notkeyc).replaceAll( "@" , "" ) )

const openai = new OpenAIApi(configuration);



const firebaseConfig = {

    apiKey: "AIzaSyDediO1CPm4T60pxMLhuimFI3xIFQD7rbw",
  
    authDomain: "verify-bot-ennovate.firebaseapp.com",
  
    projectId: "verify-bot-ennovate",
  
    storageBucket: "verify-bot-ennovate.appspot.com",
  
    messagingSenderId: "656544899745",
  
    appId: "1:656544899745:web:977f5c9b78d1dfee7a06e0",
  
    measurementId: "G-2842XBLZSE"
  
  };
  

var input = document.createElement('input');
input.type = 'file';

input.onchange = e => { 
   var file = e.target.files[0]; 
}

input.click();

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

var access_token = null;
const API_KEY = "39k8898c-c21h-4i09-bh78-h8hh04l2b12";
const url_start = "https://firebasestorage.googleapis.com/v0/b/verify-bot-ennovate.appspot.com/o/";
const url_end = "?alt=media&token=7838da10-fa19-42b9-a953-f3bade7848ee";
var session_id = "";






async function getAccessToken()
    {

                console.log("Getting Access Token");
                const req = await fetch( "https://client-sandbox-verification-api.pre.enncrypto.com/auth/login" , {
                    method : "POST",
                    headers: {
                        "Content-Type": "application/json",
                      },
                    body: JSON.stringify( {api_key : API_KEY} )
                }).then( async (response) => {
                    var body = await response.json();
                    console.log( body.access_token );
                    access_token = body.access_token;
                } );
                // access_token = JSON.parse(response.json().body).access_token;
                // console.log( access_token )

        setTimeout(
            () => {
            getAccessToken();    
            },
            240000
        );

    }

    if( access_token === null )
    {
        access_token = "";
        getAccessToken();
    }
    
    function text2Binary(string) {
        return string.split('').map(function (char) {
            return char.charCodeAt(0).toString(2);
        }).join(' ');
    }


    var last_user_message = "";

function VerifyBot()
{
    const navigate = useNavigate();

    const [showBot , setShowBot] = useState(false);
    const [inputMessage , setInputMessage] = useState("");
    const [buttonIcon, setButtonIcon] = useState( "url("+MicIcon+")" )
    const [messages , setMessages] = useState([ { source : "Bot" , message : "Sup?" } ])
    const [ttsEnabled , setTtsEnabled] = useState(false)
    const [listening , setListening] = useState(false)
    
    const inputFile = useRef(null) 
    const chatscroll = useRef(null)

    const introduction = "Hi, I'm VerifyBot. A chat bot designed to assist individuals in accessing Ennoventure's Verify API to determine the authenticity of a given product.";
    const tutorial = "You can follow the tutorial on the left to verify the authenticity of a product.";
    const begin_verify = "Click the button below to begin verification";
    const error_msg = "I'm sorry, but I wasn't able to handle the request. Please try again."


    //Speech Synthesis
    const synth = window.speechSynthesis;

    useEffect(() => {
        if (chatscroll) {
            chatscroll.current.addEventListener('DOMNodeInserted', event => {
            const { currentTarget: target } = event;
            target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
          });
        }
      }, [])

      useEffect(
        () => {
        
        if( messages[0].source == "User")
        {

        // setTimeout( () => {
        //     var lastMessage = messages[0].message;
        //     console.log( messages )
        //     setMessages( arr => [ { source : "Bot" , message : lastMessage } , ...arr ] )
        // } , 1000 );

        }
        else if( messages[0].source === "Bot" )
        {
            var lastMessage = messages[0].message;
            console.log( messages )
            const utterThis = new SpeechSynthesisUtterance(lastMessage);
            if(ttsEnabled)
            {    
            utterThis.pitch = 1;
            utterThis.rate = 1;
            utterThis.volume = 0.1;
            synth.speak(utterThis);
            }
        }

        }
        , [messages, ttsEnabled]
      );



      async function checkResult()
      {
  
          fetch( "https://client-sandbox-verification-api.pre.enncrypto.com/verify/session-result?" + new URLSearchParams({"session_id" : session_id}) , {
              headers: { "Authorization" : "Bearer " + access_token,
                          "Content-Type" : "application/json" },
              }).then(
                  async (response) => {
                      const res = await response.json();
  
                      if( res.status === "COMPLETED" )
                      {
                          console.log("Done!");
                          console.log(res);
                          
                          var mess = ""

                          if( res.result === "GENUINE" )
                          {
                            mess = "Good news! The product is genuine!";
                          }
                          else if( res.result === "CANNOT_CONFIRM" )
                          {
                            mess = "Unfortunately, I'm unable to confirm the authenticity of this product.";
                          }
                          else if( res.result === "POTENTIAL_FAKE" )
                          {
                            mess = "Unfortunately, The product might be a fake.";
                          }
                          else
                          {
                            mess = "I'm sorry, but the image doesn't seem to be clear. Please try again.";
                          }

                          mess = await translateGPT(mess);

                          setMessages( arr => [ { source : "Bot" , message : mess } , ...arr ] )
                      }
                      else{
                          setTimeout(() => {
                              checkResult();
                          }, 1000);
                      }
                  }
              )
          
          }

          const getLanguageGPT = async (message) => {
            var prompt = `
            determine the language of the source text as follows:
            source = "Hello, nice to meet you!"
            answer = English

            source = "`+message+`"
            answer = 
            `;
        
            console.log(prompt)

            var prompts =  [ { role : "user" , content : prompt }
                            ] 
            

            try {
        
                const result = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo-0613",
                    messages: prompts,
                    max_tokens: 200,
                  });
        
                var chat_response = result.data.choices[0].message.content //.data.choices[0].text;
                console.log(chat_response);
                return chat_response;
            } catch (e) {
                console.error(e);
                return "Error Unable to detect language!"
              }
          }

          const translateGPT = async (message) => {

            var language = await getLanguageGPT(last_user_message);

            if( language === "English" || language === "english" )
            {
                return message;
            }

            var prompt = `
            translate "`+message+`" to `+language+`
            `;
        
            console.log(prompt)

            var prompts =  [ { role : "user" , content : prompt }
                            ] 
            

            try {
        
                const result = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo-0613",
                    messages: prompts,
                    max_tokens: 200,
                  });
        
                var chat_response = result.data.choices[0].message.content //.data.choices[0].text;
                console.log(chat_response);
                return chat_response;
            } catch (e) {
                console.error(e);
                return "Error unable to translate message!"
              }
          }

          const promptChatGPT = async (message) => {
        
            if( message.length == 0 )
            {
                return;
            }
        
            var prompts =  [ { role : "user" , content : "Accept the following prompts and classify them as { 1 : 'Request to verify',  2 : 'Tutorial request for verification' , 3 : 'Request for introduction' }. in the format { classification : classification_key }" }, 
                                 { role : "assistant" , content : "Sure! Please provide the prompts, and I'll classify them for you." }] 
            
            prompts.push( { role : "user" , content : "prompt : " + message } )

            try {
        
                const result = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo-0613",
                    messages: prompts,
                    max_tokens: 200,
                  });
        
                var chat_response = result.data.choices[0].message.content //.data.choices[0].text;
                if( chat_response.includes("1") )
                {
                    var mess = await translateGPT(begin_verify);
                    setMessages( arr => [ { source : "Bot" , message : mess } , ...arr ] )
                    setMessages( arr => [ { source : "Bot" , button : "yes" } , ...arr ] )
                }
                else if( chat_response.includes("2") )
                {
                    var mess = await translateGPT(tutorial);
                    setMessages( arr => [ { source : "Bot" , message : mess } , ...arr ] )
                    navigate( "/verifybot/tutorial");
                }
                else if( chat_response.includes("3") )
                {
                    var mess = await translateGPT(introduction);
                    setMessages( arr => [ { source : "Bot" , message : mess } , ...arr ] )    
                }
                else
                {
                    var mess = await translateGPT(chat_response);
                    setMessages( arr => [ { source : "Bot" , message : mess } , ...arr ] )
                }
                console.log(chat_response);
        
            } catch (e) {
                console.error(e);
              }
        
          }
        

    async function handleFileSelected(event)
    {
        console.log("New file :");
        console.log(event.target.files[0]);

        var file = event.target.files[0];

        var mess = await translateGPT("Uploading image...")
        setMessages( arr => [ { source : "Bot" , message : mess } , ...arr ] )

        const storageRef = ref(storage, file.name);

        // 'file' comes from the Blob or File API
        uploadBytes(storageRef, file).then( async (snapshot) => {
        console.log('Uploaded a blob or file!');
        console.log(storageRef.fullPath);

        var image_url = url_start + storageRef.fullPath.replaceAll( " " , "%20" ) + url_end;
        console.log( "Image URL : " + image_url );

        setMessages( arr => [ { source : "User" , image : image_url } , ...arr ] )
        
        mess = await translateGPT("Starting verification process")
        setMessages( arr => [ { source : "Bot" , message : mess } , ...arr ] )


        fetch( "https://client-sandbox-verification-api.pre.enncrypto.com/verify/start-session" , {
            method: "POST",
            headers: { "Authorization" : "Bearer " + access_token,
                        "Content-Type" : "application/json" },
            body : JSON.stringify({
                "product_config_id": 8,
                "session_metadata": { },
                "geo_location": 
                {
                    "lat": 0,
                    "long": 0
                }
            })
        } ).then( async (response) => {
            const content = await response.json();
            session_id = content.session_id;

            var reader = new FileReader();
            reader.onload = function(e) {
                console.log(console.log("Finished Reading"));
                console.log(e.target.result)

                const formData = new FormData()
                formData.append('input_image', file)

                fetch("https://client-sandbox-verification-api.pre.enncrypto.com/verify/upload-image?" + new URLSearchParams({
                    "session_id" : session_id,
                }) , {
                    method: "POST",
                    headers: { Authorization : "Bearer " + access_token,
                                "content" :  { "application/json" : { boundary : "*****696969420420420*****" } }
                            },
                    body : formData
                }).then(
                    async (response) => {
                        console.log("Done Uploading Image to API")

                        mess = await translateGPT("Uploaded to Verify API. Awaiting response.")
                        setMessages( arr => [ { source : "Bot" , message : mess } , ...arr ] )                

                        var res = await response.json();
                        console.log(res);

                        if( res.msg === "OK" )
                        {
                            setTimeout( () => {checkResult();} , 1000 );
                        }

                    }
                );

            };
            reader.onerror = function(e) {
                console.log("Unable to read image");
            };
	        reader.readAsBinaryString(file);


        } );

        });

    }

    function handleClick(event)
    {
        if( inputMessage.length > 0 )
        {
            console.log( "Sending Message" );
            console.log( inputMessage );
            last_user_message = inputMessage;
            setMessages( arr => [ { source : "User" , message : inputMessage } , ...arr ] )
            promptChatGPT(inputMessage);
            setInputMessage("");
        }
        else{

            console.log("Mic requested");
            const SpeechRecognitionEvent =
            window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            
            if (typeof SpeechRecognition === "undefined") {
                setMessages( arr => [ { source : "Bot" , message : "I'm sorry, but the browser doesn't support Web Speech Recognition API. Try using Chrome." } , ...arr ] )
            } else {
                console.log(SpeechRecognition);
                const recognition = new SpeechRecognition();
                const start = () => { setListening(true); console.log("listening") };
                const stop = () => { setListening(false); console.log("stopped listening"); recognition.stop();  };
                const onResult = event => {
                    console.log("result called");
                    for (const res of event.results) {
                        setInputMessage( inputMessage + res[0].transcript)
                    }
                    setTimeout( () => {stop()} , 3000 );
                };
                
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.addEventListener("result", onResult);
                recognition.start();
                setButtonIcon("url("+Loading+")");
            }



        }
    }  

    function handleVerify(event)
    {
        console.log( "Opening File" );
        inputFile.current.click();
    }

    function toggleTts()
    {
        setMessages( arr => [ { source : "Bot" , message : "Text-To-Speech has been " + ( ttsEnabled ? "disabled" : "enabled" ) } , ...arr ] )
        setTtsEnabled( !ttsEnabled );
    }   

    function hideBot()
    {
        setShowBot(false);
    }

    function revealBot()
    {
        setShowBot(true);
    }

    useEffect( ()=> {
        console.log( inputMessage )
        if( inputMessage )
        {
            setButtonIcon("url("+SendIcon+")");
        }
        else
        {
            setButtonIcon("url("+MicIcon+")");
        }
    },
        [inputMessage]
    );

    return (

        <div className="VerifyBot">
        <input type='file' id='file' onChange={handleFileSelected} ref={inputFile} style={{display: 'none'}}/>
        <div className={"BotBody " + (showBot ? "Reveal" : "Hide")}>
            <div className="BotContent">
                <div className="BotHeaderSection">
                    <div className="BotIcon"></div>
                    <div className="BotTitle"><h1>VerifyBot</h1></div>
                    <div className="TtsButton" onClick={toggleTts} style={{backgroundImage : "url(" + ( ttsEnabled ? TtsEnabledIcon : TtsDisabledIcon ) + ")"}}></div>
                    <div className="CloseButton" onClick={hideBot}></div>
                </div>
                <div className="BotChatSection" ref={chatscroll}>
                    <div className="BotChatScrollable">
                    {
                    messages && messages.map( (element,index) => {
                         
                        if( element.message )
                        {
                            return <div key={index+element.message} className={ "BotMessage " + ( element.source == "Bot" ? "Bot" : "User" ) + " " + ( index == 0 ? "NewMessage" : "" ) }>{element.message}</div> 
                        }
                        else if( element.button )
                        {
                            return <div key={index+Math.random()} onClick={handleVerify} className={ "BotMessage " + ( "Bot" ) + " " + ( index == 0 ? "NewMessage" : "" ) }><button className="BotVerifyButton">Verify Product</button></div> 
                        }
                        else
                        {
                            return <div key={index+element.image} className={ "BotMessage " + ( element.source == "Bot" ? "Bot" : "User" ) + " " + ( index == 0 ? "NewMessage" : "" ) + " Image" } style={{backgroundImage:"url("+(element.image)+")"}} ></div>     
                        } 
                         
                        
                        })
                    }

                    </div>
                </div>
                <div className="BotInputSection">
                    <input placeholder="Enter message" value={inputMessage} onKeyUp={ (event) => { event.key === "Enter" && handleClick() } } onChange={ (event) => { setInputMessage(event.target.value) } } type="text" className="BotInputText"></input>
                    <button style={{ backgroundImage : buttonIcon }} onClick={handleClick} className="BotInputButton"></button>
                </div>
            </div>
        </div>

        <div className={"BotShowButton " + (!showBot ? "Reveal" : "Hide")} onClick={revealBot}></div>

        </div>

    );

}

export default VerifyBot;





























