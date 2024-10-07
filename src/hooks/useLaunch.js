import axios from "axios";
import FormData from 'form-data';

//const BASE_URL = "http://localhost:3000/api";
const API_KEY = 'b0d3c83fda71caff078b';
const API_SECRET = 'b2893d5c88b25af6ef4e58fadb4be3afd89af090dce647247f818699819d00ae';
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5YmUyNTI4Ni1iMDQ0LTRjYzYtYWE3Ni1hZDgzZGY5YTVkNDgiLCJlbWFpbCI6ImVodGFzaGFtLnNweXJlc3luY0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYjBkM2M4M2ZkYTcxY2FmZjA3OGIiLCJzY29wZWRLZXlTZWNyZXQiOiJiMjg5M2Q1Yzg4YjI1YWY2ZWY0ZTU4ZmFkYjRiZTNhZmQ4OWFmMDkwZGNlNjQ3MjQ3ZjgxODY5OTgxOWQwMGFlIiwiZXhwIjoxNzU4Nzc0MzY3fQ.i-UnCaUnIoKd_S19krFwqOxEKUcAA7XWfrtUEfn2VEA';



// const BASE_URL = "https://launch-pad-g69q.vercel.app/api";

 const BASE_URL = "https://launchpad-0imn.onrender.com/api";



export const postLaunch = async (data) => {
    //  
    try {
        data.userId = localStorage.getItem("userId");
        const response = await axios.post(`${BASE_URL}/launchSetting/upsertLaunchSettings`, data);
        return response.data;
    } catch (error) {
        console.error("Error getting User", error);
        throw error;
    }
};

export const postUser = async (data) => {
    //  
    try {

        const response = await axios.post(`${BASE_URL}/user/adduser`, data);

        localStorage.setItem("userId", response.data._id)
        return response.data;

    } catch (error) {
        console.error("Error getting User", error);
        throw error;
    }
};



export const upsertWallet = async (data, id) => {
    //console.log("data", data);
    try {
        const response = await axios.post(`${BASE_URL}/walletService/upsertWallet`, {
            wallets: data,
            projectId: id
        });
        return response.data;
    } catch (error) {
        console.error("Error getting User", error);
        throw error;
    }
};


export const TokenLaunch = async (data) => {
    //  
    try {
        // data.userId = localStorage.getItem("userId");
        const response = await axios.post(`${BASE_URL}/projectSettingsService/getProjectDetail`, {
            projectId: localStorage.getItem("projectId"),
            userId: localStorage.getItem("solanaKey"),
        });
        return response.data;
    } catch (error) {
        console.error("Error getting User", error);
        throw error;
    }
};


export const removeLPCall = async (data) => {
    //  
    try {
        // data.userId = localStorage.getItem("userId");
        const response = await axios.post(`${BASE_URL}/removeLP`, {
            projectId: localStorage.getItem("projectId"),
            userId: localStorage.getItem("solanaKey"),
        });
        return response.data;
    } catch (error) {
        console.error("Error getting User", error);
        throw error;
    }
};



export const burnLPCall = async (data) => {
    //  
    try {
        // data.userId = localStorage.getItem("userId");
        const response = await axios.post(`${BASE_URL}/burnLP`, {
            projectId: localStorage.getItem("projectId"),
            userId: localStorage.getItem("solanaKey"),
        });
        return response.data;
    } catch (error) {
        console.error("Error getting User", error);
        throw error;
    }
};


export const mintToken = async (data) => {
    //  
    try {
        // data.userId = localStorage.getItem("userId");
        const response = await axios.post(`${BASE_URL}/mintSettingsService/upsertProject`, {
            userId: localStorage.getItem("userId"),
            projectData: data
        });
        return response.data;
    } catch (error) {
        console.error("Error getting User", error);
        throw error;
    }
};

export const getMintsettings = async (data) => {
    //  
    try {
        const response = await axios.post(`${BASE_URL}/mintSettingsService/getProject`, {
            userId: localStorage.getItem("userId"),
        });
        return response.data;
    } catch (error) {
        console.error("Error getting User", error);
        throw error;
    }
};



export const imageUpload = async (file) => {
    // debugger
    try {
        const response = await axios.post(`${BASE_URL}/imageUpload`, file, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error getting User", error);
        throw error;
    }

};

export const meteDataUpload = async (data) => {
    //  
    try {
        const response = await axios.post(`${BASE_URL}/metadataUpload`, {
            metadata: data
        });
        return response.data;
    } catch (error) {
        console.error("Error getting User", error);
        throw error;
    }
};

export const sellAllAPi = async (data) => {
    //  
    try {
        const response = await axios.post(`${BASE_URL}/sellAll`, {
            projectId: localStorage.getItem("projectId"),
            userId: localStorage.getItem("solanaKey"),
        });
        return response.data;
    } catch (error) {
        console.error("Error getting User", error);
        throw error;
    }
};

export const tokenCreate = async (hash, metadata, key, freeze, mint) => {
    // debugger
    //  
    try {
        // debugger
        console.log(metadata )
        const response = await axios.post(`${BASE_URL}/createToken`, {
            metaData: metadata,
            hash: hash,
            publicKey: key,
            freeze: freeze,
            mintAuthority: mint
        });
        return response.data;
    } catch (error) {
        console.error("Error getting User", error);
        throw error;
    }
};
