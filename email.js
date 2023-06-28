%
% [
    set @No_emails = QueryParameter("value")
    Set @AccountID = QueryParameter("MID")
    /* ----------------------------------------------------------------Fetching latest campaign code and name from the DE----------------------------------------------------------------- */
    Set @rows = LookupOrderedRows("[Main Campaign DE]", 1, "date_added Desc", "Flag", 1)
    IF rowcount(@rows) > 0 then
    Set @campaign_code = Field(Row(@rows, 1), 'Campaign_Code')
    Set @Campaign_Name = Field(Row(@rows, 1), 'Campaign_Name')
    Set @Start_Date = Field(Row(@rows, 1), 'start_Date')
    Set @Frontend_Mailing_Name = Field(Row(@rows, 1), 'Frontend_Mailing_Name')
    endif
    /*------------------------------------------------------------------- Fetching clientID,clientSecret and URL details --------------------------------------------*/
    Set @rows = LookupRows("[API Credentials]", "Flag", 1)
    Set @client_id = Field(Row(@rows, 1), 'client_id')
    Set @client_secret = Field(Row(@rows, 1), 'client_secret')
    Set @URL = Field(Row(@rows, 1), 'URL')
    Set @Rest_URL = Field(Row(@rows, 1), 'Rest_url')
    Set @Assets_Rows = LookupOrderedRows("[Campaign Assets DE]", 1, "date_added Desc", "Asset_Type", "Email", "Campaign_code", @campaign_code)
    IF rowcount(@Assets_Rows) > 0 then
    Set @Asset_name = Field(Row(@Assets_Rows, 1), 'Asset_name')
    else
        Set @Asset_name = ""
    endif

    Set @FolderID = Lookup("[Content Builder Folder ID]", "FolderID", "MID", @AccountID)
    IF ISNULL(@FolderID) then
] % %

Please add data about parent folder ID corresponding to that BU in data extension %
    % [
        else
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

var Campaign_Name = Campaign_Name1.replace(/\s+/g, '-');
var campaign_code = Variable.GetValue("@campaign_code");
var asset_name = Variable.GetValue("@Asset_name");
var Start_Date = Variable.GetValue("@Start_Date");
var number_Emails = Variable.GetValue("@No_emails");
var frontEndMailingName = Variable.GetValue("@Frontend_Mailing_Name");
var frontEndMailingNameList = frontEndMailingName.split(",");
number_Emails = frontEndMailingNameList.length;
var dt = new Date(Start_Date);

var date = dt.getDate();
/*to retrieve month to use in email name*/
var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Augu", "Sept", "Oct", "Nov", "Dec"];
var month = monthNames[dt.getMonth()];
var year = Stringify(dt.getFullYear()).substring(2, 4);
var Email_Name = Campaign_Name + '_' + month + year + '_' + "Email";
//var val = assetname.substring(0,assetname.length-2);
try {
    if (asset_name == "") {
        /*--------------------------------------------------------------------------------Payload to generate acess token------------------------------------------------*/
        var payload = {
            client_id: clientid,
            client_secret: clientsecret,
            grant_type: grantType,
            account_id: accountId
        };
        var accesstoken = '';
        /*-------------------------------------------------------Access Token Generation----------------------------------------------------------*/
        var accessTokenRequest = HTTP.Post(url, contentType, Stringify(payload));
        if (accessTokenRequest.StatusCode == 200) {
            var tokenResponse = Platform.Function.ParseJSON(accessTokenRequest.Response[0]);
            accesstoken = tokenResponse.access_token;
        } else // Call failed, return nothing
        {
            Write("Error");
        }
        /*Write(accesstoken);*/
        var headerNames = ["Authorization"];
        var headerValues = ["Bearer " + accesstoken];
        var Parent_id = Variable.GetValue("@FolderID");
        var Folder_name = Campaign_Name;
        var description = 'Related to campaign' + Campaign_Name;

        var Resturl = RestURL + "/asset/v1/content/categories";
        /*-------------------------------------------------------------------------------paylaod to create Content Builder Folder---------------------------------------------------------*/
        var payload2 = '{';
        payload2 += ' "Name":' + '"' + Folder_name + '",';
        payload2 += ' "ParentId":' + '"' + Parent_id + '",';
        payload2 += ' "description":' + '"' + description + '"';
        payload2 += ' }';
        var resp = [0];
        /*--------------------------------------------------------------------------Folder Creation*-------------------------------------------------------*/
        var result1 = Platform.Function.HTTPPost(Resturl, contentType, payload2, headerNames, headerValues, resp);
        // Write("<br>result1"+Stringify(resp));

        var ResponseContent = resp[0];
        var response = Platform.Function.ParseJSON(ResponseContent);
        var Categoryid = response.id;
        var Resturl_Email = RestURL + "/asset/v1/content/assets";
        /*-------------------------------------------------------------------------------loop to create mutilpe emails---------------------------------------------------------*/
        for (var i = 0; i < number_Emails; i++) {
            var CustomerKey = '';

            Email_Name = frontEndMailingNameList[i];
            CustomerKey = Platform.Function.GUID();
            Email_Name = Email_Name.replace(/\s+/g, '-');

            /*-------------------------------------------------------------------------------paylaod to create Email---------------------------------------------------------*/
            var Restur_Email = RestURL + "/asset/v1/content/assets/39219";

            var resp = [0];
            var result2 = HTTP.Get(Restur_Email, headerNames, headerValues);
            var Payload2 = Platform.Function.ParseJSON(result2.Content);
            delete Payload2.id;
            delete Payload2.contentType;
            delete Payload2.owner;
            delete Payload2.createdDate;
            delete Payload2.createdBy;
            delete Payload2.modifiedDate;
            delete Payload2.modifiedBy;
            delete Payload2.enterpriseId;
            delete Payload2.memberId;
            delete Payload2.thumbnail;
            delete Payload2.legacyData;
            delete Payload2.status;
            delete Payload2.data.email.legacy;
            delete Payload2.data.approvals;
            delete Payload2.category.parentId;
            delete Payload2.category.name;
            //delete Payload2.views.html.slots.myslot.design;
            Payload2.customerKey = CustomerKey;
            Payload2.name = Email_Name;
            Payload2.category.id = Categoryid;

            var payload1 = Stringify(Platform.Function.ParseJSON(Stringify(Payload2)));
            /*---------------------------------------------------------------------Email Creation------------------------------------------------------------------------------------*/
            var resp = [0];
            var result1 = Platform.Function.HTTPPost(Resturl_Email, contentType, payload1, headerNames, headerValues, resp);
            if (result1 == 201) {
                var rows = Platform.Function.InsertData("[Campaign Assets DE]", ["Campaign_code", "Campaiagn_Name", "Asset_Type", "Asset_name", "date_added"], [campaign_code, Campaign_Name, "Email", Email_Name, Now()]);
                Write("Email Name:" + Email_Name + "----created successfully");
            }
            Write("<br>");
        }
    } else {
        Write("Already created");
    }
} catch (e) {
    e = Stringify(e).replace(/[\n\r]/g, '')
    var rows = Platform.Function.InsertData("[Assets Error Log]", ["Campaign_code", "Campaiagn_Name", "Asset_Type", "Asset_name", "date_added"], [campaign_code, Campaign_Name, "Email", Email_Name, Now()]);
    Write(e);
} <
/script> %
% [
    endif
] % %
