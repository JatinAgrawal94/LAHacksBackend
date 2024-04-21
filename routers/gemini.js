const express=require('express')
const gemini=express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv=require('dotenv')
dotenv.config()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function removeChar(text){
    text=(text.replace(/[`]+/g, ''));
    text = text.substring(0, 5) + text.substring(5).replace(/\s/, "");
    if(text.startsWith('JSON')){
        text=text.substring(4)
    }else if(text.startsWith('json')){
        text=text.substring(4)
    }
    return text
}

gemini.get('/places',async(req,res)=>{
    const query=req.query

    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const prompt = `Suggest me some places to visit. Consider the information. budget=$${query.budget}, current_location:${query.source},destination:${query.destination},leaving_date:${query.start_date},return_date:${query.return_date}.Consider all possible destinations with their coordinates and give a total estimate for each. Give me response in JSON format with keys as destination, coordinates(only numeric), estimated_cost(in dollars).Also give results according to my API plan.Name the array as "data"`
    // const prompt="Suggest me some flights from lax to sfo tomorrow along with links to book that flight. Give me response in JSON format."
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        var text = response.text();
        text=removeChar(text)
        res.send(text)
    } catch (error) {
        console.log(error)
        res.send("No Response")
    }
})

gemini.get('/places/transportation',async(req,res)=>{
    const query=req.query   
    var prompts=[
        `input: Give me all flight details with parameters source=${query.source} ,destination=${query.destination},start_date:${query.start_date},return_date:${query.return_date}. Provide me multile results for inbound and outbound for the trip.Also give me links to those.Use format data={\"inbound_flight\"([Array having {flight_operator,departure_airport_Code,arrival_airport_Code,departure_time,arrival_time,depart_date,arrival_date,flight_id}]), \"outbound_flight\"([array having {flight_operator,departure_airport_code,arrival_airport_code,departure_time,arrival_time,depart_date,arrival_date,flight_id}])}.Give response in JSON format.Also give results according to my API plan.Name the array as \"data\"",
        "output: data={\"inbound_flight\"([Array having {flight_operator,departure_airport_code,arrival_airport_code,departure_time,arrival_time,depart_date,arrival_date,flight_id,cost(in dollars)}]), \"outbound_flight\"([array having {flight_operator,departure_airport_code,arrival_airport_code,departure_time,arrival_time,depart_date,arrival_date,flight_id}])}",
        "input: Give me all flight details with parameters source=New York,destination=Los Angeles,start_date:20th April, 2024,return_date:25th April,2024 Provide me multile results for inbound and outbound for the trip.Also give me links to those."`
      ]
      
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    // const prompt=`Give me all flight details with parameters source=${query.source} , destination=${query.destination},start_date:${query.start_date},return_date:${query.return_date}. Provide me multile results for inbound and outbound for the trip.Also give me links to those.Use format data={"inbound_flight"([Array having {flight_operator,departure_airport_Code,arrival_airport_code,departure_time,arrival_time,depart_date,arrival_date,flight_id}]), "outbound_flight"([array having {flight_operator,departure_airport_code,arrival_airport_code,departure_time,arrival_time,depart_date,arrival_date,flight_id}])}.Give response in JSON format.Also give results according to my API plan.Name the array as "data"`

    const prompt=`Flight Suggestions Request:

    Source: ${query.source}
    Destination: ${query.destination}
    Departure_Date: ${query.start_date}
    Return_Date: ${query.return_date}
    
    Please provide flight suggestions meeting the specified criteria, including both direct and connecting flights for both inbound and outbound journeys. The response should include flight details with the following keys:
    
    {
      "inbound_flights": [
        {
          "flight_id": "B8649",
          "departure_date": "04/20/2024",
          "arrival_date": "04/22/2024",
          "departure_airport_code": "LAX",
          "arrival_airport_code": "JFK",
          "departure_time": "09:00",
          "arrival_time": "08:00",
          "cost_of_flight": "$800",
          "flight_operator": "RandomAirways",
          "connecting_flights": [
            {
              "flight_id": "C1234",
              "departure_date": "04/21/2024",
              "arrival_date": "04/22/2024",
              "departure_airport_code": "SFO",
              "arrival_airport_code": "LAX",
              "departure_time": "12:00",
              "arrival_time": "14:00",
              "cost_of_flight": "$200",
              "flight_operator": "ConnectAir"
            }
          ]
        }
      ],
      "outbound_flights": [
        {
          "flight_id": "B8649",
          "departure_date": "04/26/2024",
          "arrival_date": "04/27/2024",
          "departure_airport_code": "JFK",
          "arrival_airport_code": "LAX",
          "departure_time": "09:00",
          "arrival_time": "18:00",
          "cost_of_flight": "$900",
          "flight_operator": "SkyTravel",
          "connecting_flights": [
            {
              "flight_id": "D5678",
              "departure_date": "04/27/2024",
              "arrival_date": "04/28/2024",
              "departure_airport_code": "LAX",
              "arrival_airport_code": "SFO",
              "departure_time": "10:00",
              "arrival_time": "12:00",
              "cost_of_flight": "$250",
              "flight_operator": "ConnectAir"
            }
          ]
        }
      ]
    }
    
    `
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        var text = response.text();
        text=removeChar(text)
        res.send(text)
    } catch (error) {
        console.log(error)
        res.send("No Response")
    }
})

gemini.get('/places/poi',async(req,res)=>{
    const query=req.query
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const prompt=`Tourist Place Recommendation Request:

    Input:
    - Destination ${query.destination}
    
    Output Format:
    Please provide recommendations for places to visit in given destination. The response should include details with the following keys in JSON format only:
    
    [
      {
        "name": "Place X",
        "address": "1123 X Street",
        "hours": "10AM to 12PM",
        "reviews": [
          {
            "author": "John Doe",
            "review": "This is a good place"
          },
          {
            "author": "Jane Smith",
            "review": "Great experience, friendly staff!"
          }
        ]
      },
      {
        "name": "Place Y",
        "address": "1124 X Street",
        "hours": "10PM to 12PM",
        "reviews": [
          {
            "author": "John Noga",
            "review": "This is a bad place"
          },
          {
            "author": "Jane dagger",
            "review": "Great experience, friendly staff!"
          }
        ]
      }
    ]
    `
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        var text = response.text();
        text=removeChar(text)
        res.send(text)
    } catch (error) {
        console.log(error)
        res.send("No Response")
    }
})


gemini.get('/places/stays',async(req,res)=>{
    const query=req.query
    // suggest stays near my arrival location in that city and 
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    
    // const prompt=`Give me top 5 stays details along with top 3 google reviews for each with parameters current_location:${query.destination},checkin_date:${query.start_date},checkout_date:${query.return_date}.Suggest a stay near to these places ${query.places_to_visit} and ${query.current_location}.Also give me links to book those.Limit the review description text to 8 words.Give response in JSON format. Name the array as "data"`
    const prompt=`Popular Hotel Suggestions Request:

    Arrival Airport: ${query.current_location}
    
    Please provide hotel suggestions meeting the specified criteria. The response should include hotel details with the following keys:
    
    [
      {
        "name": "Hotel X",
        "address": "1123 X Street",
        "price": "$435",
        "booking_link": "https://example.com/hotel_x_booking",
        "reviews": [
          {
            "author": "John Doe",
            "review": "This is a good motel"
          },
          {
            "author": "Jane Smith",
            "review": "Great experience, friendly staff!"
          },
          {
            "author": "Alice Johnson",
            "review": "Clean rooms and excellent service"
          }
        ]
      }
    ]
    `
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        var text = response.text();
        text=removeChar(text)
        res.send(text)
    } catch (error) {
        console.log(error)
        res.send("No Response")
    }
})

gemini.get('/places/food',async(req,res)=>{
    const query=req.query
    // suggest stays near my arrival location in that city and 
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    
    // const prompt=`Give me top 5 food places along with 2 google reviews for each with parameters stay_location:${query.stay_location} in ${query.destination},checkin_date:${query.start_date},checkout_date:${query.return_date}.Suggest 5 places near to ${query.places_to_visit}, ${query.stay_location}.Give me distances of the ${query.places_to_visit} and ${query.stay_location} from the food places.Also give me links to book those and their hours.Give response in JSON format.Limit the review description text to 8 words.Name the array as "data"`
    const prompt=`Restaurant Recommendation Request:
    Input:
    - destination ${query.destination}

    Output Format:
    The response should include details with the following keys:
    
    [
      {
        "name": "Restaurant X",
        "address": "1123 X Street",
        "type_of_food": "Thai",
        "price_per_person": "$435",
        "reviews": [
          {
            "author": "John Doe",
            "review": "This is a good restaurant"
          },
          {
            "author": "Jane Smith",
            "review": "Great food, excellent service!"
          }
        ]
      }
    ]
    
    Please ignore any factors other than the ones explicitly mentioned in the input when choosing the food place.
    
    `
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        var text = response.text();
        text=removeChar(text)
        res.send(text)
    } catch (error) {
        console.log(error)
        res.send("No Response")
    }
})

module.exports=gemini