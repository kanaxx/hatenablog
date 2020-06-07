//setting your environment
const myEndpoint = 'https://--yourdomain--.microcms.io/api/v1/--yourcontents--';
const myKey = '--your api key--';
const doRedirect = true;

redirectWhen404(myEndpoint, myKey, doRedirect);
///-----

async function redirectWhen404(microCmsURL, microCmsKey, doRedirect){

    let pathName = window.location.pathname;
    console.info('Hatenablog-redirect| pathName=%s', pathName);

    //previewは対象外
    if( pathName == '/preview'){
        console.log('Hatenablog-redirect| Preview page is not supported this script.');
        return;
    }

    let notFoundPage = isThisPage404();
    console.log('Hatenablog-redirect| 404=', notFoundPage);
    if( !notFoundPage ){
        return;
    }

    //microCMSへの確認をするURLを選別
    //apiの呼び出し回数が気にならなければ、条件なしでもよい。
    if( !pathName.startsWith('/entry/') && !pathName.startsWith('/archive/category/') ){
        console.log('Hatenablog-redirect| This page is not supported this script.');
        return;
    }

    let apiResult = await findRedirectPath(pathName);
    console.log(apiResult);

    if(!apiResult){
        //microCMS does not return 200

    }else if(apiResult.totalCount !=1){
        console.log('Hatenablog-redirect| new Pathname is not found from api = %s', pathName);
        //行先が定義されていないページ
        //カスタム404っぽくするために、DOMをいじるならここでどうぞ

    }else{
        let newPathName = apiResult.contents[0].newPathName;
        console.info('Hatenablog-redirect| * Redirect to %s', newPathName);
        if(doRedirect){
            //ここで転送
            //http(s)から始まってるなら、そのまま転送してあげる
            if( newPathName.startsWith('http://') || newPathName.startsWith('https://') ){
                window.location.href = newPathName;
            }else{
                window.location.href = window.location.origin + newPathName;
            }
        }
    }


    async function findRedirectPath(pathName){
        let parameter = `?fields=motoPathName,newPathName&filters=motoPathName[equals]${pathName}`;
        let url = microCmsURL + parameter;
        let config = {
            method: "GET",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "X-API-KEY": microCmsKey,
            },
        };

        let response = await fetch(url, config);
        if( response.status != 200){
            console.error('microCMS returns status %s',response.status);
            return null;
        }
        let json = await response.json();
        return json;
    }

    function getCanonical(){
        var links = document.getElementsByTagName("link");
        for ( i in links) {
            if (links[i].rel && links[i].rel.toLowerCase() == "canonical") {
                return links[i].href;
            }
        }
        return "";
    }

    function isThisPage404(){
        if( getCanonical() == "" ){
            return true;
        }
        return false;
    }
}
