export default interface Service{

    commands() :{[key : string] : (any) => boolean};

    reactions() : {[key : string] : (any) => boolean}; 
}