export interface JWPlayerAuth {

    status : string; 

    message : string;

    code : string; 

    title : string;

    media : JWPlayerMedia;

    link : JWPlayerLink;

    rate_limit : JWPlayerRateLimit;
}

interface JWPlayerMedia  {
     type : string;
     key : string;
}

interface JWPlayerLink {
    path : string;
    query : JWPlayerQuery;
    protocol : string;
    address : string;

}

interface JWPlayerQuery {
    token : string;
    key : string;
}

interface JWPlayerRateLimit {
    reset : number; 
    limit : number; 
    remaning : number;
}


// export Interface JWPlayerMedia