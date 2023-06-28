%
% [
    Set @AccountID = QueryParameter("MID")
    /* ----------------------------------------------------------------Fetching latest campaign code and name from the DE----------------------------------------------------------------- */
    Set @rows = LookupOrderedRows("[Main Campaign DE]", 1, "date_added Desc", "Flag", 1)
    IF rowcount(@rows) > 0 then
    Set @campaign_code = Field(Row(@rows, 1), 'Campaign_Code')
    Set @Campaign_Name = Field(Row(@rows, 1), 'Campaign_Name')
    endif
    /*------------------------------------------------------------------- Fetching clientID,clientSecret and URL details --------------------------------------------*/
    Set @rows = LookupRows("[API Credentials]", "Flag", 1)
    Set @client_id = Field(Row(@rows, 1), 'client_id')
    Set @client_secret = Field(Row(@rows, 1), 'client_secret')
    Set @URL = Field(Row(@rows, 1), 'URL')
    Set @Rest_URL = Field(Row(@rows, 1), 'Rest_url')
    Set @Assets_Rows = LookupOrderedRows("[Campaign Assets DE]", 1, "date_added Desc", "Asset_Type", "Journey", "Campaign_code", @campaign_code)
    IF rowcount(@Assets_Rows) > 0 then
    Set @Asset_name = Field(Row(@Assets_Rows, 1), 'Asset_name')
    else
        Set @Asset_name = ""
    endif
] % %
<
script runat = "server" >
    Platform.Load("Core", "1.1.1");
/* --------------------------------------------------------------- Getting variables from ampscript ------------------------------------------------------------------*/
var clientid = Variable.GetValue("@client_id");
var clientsecret = Variable.GetValue("@client_secret");
var URLValue = Variable.GetValue("@URL");
var RestURL = Variable.GetValue("@Rest_URL");
var grantType = "client_credentials";
var accountId = Variable.GetValue("@AccountID");
var url = URLValue + "/v2/token";
var contentType = 'application/json';
var Campaign_Name1 = Variable.GetValue("@Campaign_Name");

var Campaign_Name = Campaign_Name1.replace(/\s+/g, '-');;
var campaign_code = Variable.GetValue("@campaign_code");
var asset_name = Variable.GetValue("@Asset_name");
var Journey_Name = Campaign_Name + "-" + "Journey";
try {
    if (asset_name == Journey_Name) {
        Write("Already created");
    } else {
        /*--------------------------------------------------------------------------------Payload to generate access token------------------------------------------------*/
        var payload = {
            client_id: clientid,
            client_secret: clientsecret,
            grant_type: grantType,
            account_id: accountId
        };
        /*-------------------------------------------------------Access Token Generation----------------------------------------------------------*/
        var accesstoken = '';
        /* get acces token*/
        var accessTokenRequest = HTTP.Post(url, contentType, Stringify(payload));
        if (accessTokenRequest.StatusCode == 200) {
            var tokenResponse = Platform.Function.ParseJSON(accessTokenRequest.Response[0]);
            accesstoken = tokenResponse.access_token;
        } else // Call failed, return nothing
        {
            Write("Error");
        }
        var headerNames = ["Authorization"];
        var headerValues = ["Bearer " + accesstoken];
        var Restur_Journey = RestURL + "/interaction/v1/interactions";
        /*-------------------------------------------------------------------------------payload to create Journey---------------------------------------------------------*/
        var randomID = Platform.Function.GUID();
        var description = "Journey related to campaign" + Campaign_Name;
        var payload2 = '{';
        payload2 += ' "key":' + '"' + randomID + '",';
        payload2 += ' "name":' + '"' + Journey_Name + '",';
        payload2 += ' "description":' + '"' + description + '",';
        payload2 += ' "workflowApiVersion": 1.0';
        payload2 += ' }';
        /*---------------------------------------------------------------------Journey Creation------------------------------------------------------------------------------------*/
        var result1 = Platform.Function.HTTPPost(Restur_Journey, contentType, payload2, headerNames, headerValues, resp);
        if (Stringify(result1) == 200) {
            var rows = Platform.Function.InsertData("[Campaign Assets DE]", ["Campaign_code", "Campaiagn_Name", "Asset_Type", "Asset_name", "date_added"], [campaign_code, Campaign_Name, "Journey", Journey_Name, Now()]);
            Write("Journey Name:" + Journey_Name + "----created successfully");
        }
    }
} catch (e) {
    e = Stringify(e).replace(/[\n\r]/g, '');
    var rows = Platform.Function.InsertData("[Assets Error Log]", ["Campaign_code", "Campaiagn_Name", "Asset_Type", "Asset_name", "date_added"], [campaign_code, Campaign_Name, "Journey", Journey_Name, Now()]);
    Write(e);
    Write("errored");
}
  </script>
