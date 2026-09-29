// ─── BLACK-SCHOLES ─────────────────────────────────────────────────────────
var SQRT2PI=Math.sqrt(2*Math.PI);
function normPdf(x){ return Math.exp(-0.5*x*x)/SQRT2PI; }
function normCdf(x){
    var a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429, p=0.3275911;
    var sign=x<0?-1:1; x=Math.abs(x)/Math.sqrt(2);
    var t=1/(1+p*x); var y=1-((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
    return 0.5*(1+sign*y);
}
function bsPrice(S,K,T,r,q,sigma,isCall){
    if(T<=0) return isCall? Math.max(S-K,0) : Math.max(K-S,0);
    if(sigma<=0) sigma=0.01;
    var sqrtT=Math.sqrt(T);
    var d1=(Math.log(S/K)+(r-q+0.5*sigma*sigma)*T)/(sigma*sqrtT);
    var d2=d1-sigma*sqrtT;
    var dfQ=Math.exp(-q*T), dfR=Math.exp(-r*T);
    if(isCall) return S*dfQ*normCdf(d1)-K*dfR*normCdf(d2);
    else return K*dfR*normCdf(-d2)-S*dfQ*normCdf(-d1);
}
function bsGreeks(S,K,T,r,q,sigma,isCall,daysPerYear){
    if(T<=0) return {delta:isCall?(S>K?1:0):(S<K?-1:0), gamma:0, theta:0, vega:0};
    var sqrtT=Math.sqrt(T);
    var d1=(Math.log(S/K)+(r-q+0.5*sigma*sigma)*T)/(sigma*sqrtT);
    var d2=d1-sigma*sqrtT;
    var pdf=normPdf(d1);
    var dfQ=Math.exp(-q*T);
    var delta=isCall? dfQ*normCdf(d1) : dfQ*(normCdf(d1)-1);
    var gamma=dfQ*pdf/(S*sigma*sqrtT);
    var vega=S*dfQ*pdf*sqrtT;
    daysPerYear=daysPerYear>0?daysPerYear:365;
    var term1=-(S*dfQ*pdf*sigma)/(2*sqrtT);
    var term2, theta;
    if(isCall){ term2=q*S*dfQ*normCdf(d1)-r*K*Math.exp(-r*T)*normCdf(d2); theta=(term1+term2)/daysPerYear; }
    else { term2=-q*S*dfQ*normCdf(-d1)+r*K*Math.exp(-r*T)*normCdf(-d2); theta=(term1+term2)/daysPerYear; }
    return {delta:delta, gamma:gamma, theta:theta, vega:vega, d1:d1, d2:d2};
}
function ivSolve(marketPrice,S,K,T,r,q,isCall,daysPerYear){
    var MAX_ITER=60;
    var mn=S/K;
    var sigma=mn<0.8? 0.6 : mn>1.2? 0.5 : 0.35;
    var intrinsic=isCall? Math.max(S*Math.exp(-q*T)-K*Math.exp(-r*T),0) : Math.max(K*Math.exp(-r*T)-S*Math.exp(-q*T),0);
    if(marketPrice < intrinsic*0.99) return {iv:0, ok:false, reason:'below-intrinsic'};
    var lo=0.01, hi=5.0;
    for(var i=0;i<MAX_ITER;i++){
        var price=bsPrice(S,K,T,r,q,sigma,isCall);
        var vegaRaw=bsGreeks(S,K,T,r,q,sigma,isCall,daysPerYear).vega;
        if(vegaRaw<1e-8) break;
        var diff=price-marketPrice;
        if(Math.abs(diff)<0.01) return {iv:sigma, ok:true, iter:i};
        var newSigma=sigma - diff/(vegaRaw);
        if(newSigma<=0 || newSigma>5 || isNaN(newSigma)){
            if(diff>0) hi=sigma; else lo=sigma;
            newSigma=(lo+hi)/2;
        } else {
            if(price>marketPrice) hi=Math.min(hi, sigma); else lo=Math.max(lo, sigma);
        }
        sigma=newSigma;
        if(sigma<0.01) sigma=0.01;
        if(sigma>5) sigma=5;
    }
    var finalPrice=bsPrice(S,K,T,r,q,sigma,isCall);
    var ok=Math.abs(finalPrice-marketPrice)/marketPrice < 0.05;
    return {iv:sigma, ok:ok, iter:MAX_ITER};
}

