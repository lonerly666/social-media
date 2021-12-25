import {useEffect, useState} from 'react';
import axios from 'axios';


export default function Home(){

    useEffect(async()=>{
        const ac = new AbortController();
        await axios.get('/auth/isLoggedIn')
        .then(res=>res.data)
        .catch(err=>console.log(err))
        .then(res=>{
            console.log(res);
        })
    },[])
    
    return <div>
        <h1>Hello World</h1>
    </div>
}