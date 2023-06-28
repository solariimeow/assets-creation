%
% [
    set @No_emails = QueryParameter("value")
    Set @AccountID = QueryParameter("MID")
    /*---------------------------------------------------------------------------- Fetching details of recent campaign -------------------------------------------------------------------- */
    Set @rows = LookupOrderedRows("[Main Campaign DE]", 1, "date_added Desc", "Flag", 1)
    IF rowcount(@rows) > 0 then
    Set @campaign_code = Field(Row(@rows, 1), 'Campaign_Code')
    Set @Campaign_Name = Field(Row(@rows, 1), 'Campaign_Name')
    Set @Frontend_Mailing_Name = Field(Row(@rows, 1), 'Frontend_Mailing_Name')
    endif
    /*-----------------------------------------------------Fetching details of recent DataExtension based on campaign code ----------------------------------------------------------------------------------- */
    Set @Assets_Rows = LookupOrderedRows("[Campaign Assets DE]", 1, "date_added Desc", "Asset_Type", "TriggeredSendDefinition", "Campaign_code", @campaign_code)
    IF rowcount(@Assets_Rows) > 0 then
    Set @Asset_name = Field(Row(@Assets_Rows, 1), 'Asset_name')
    else
        Set @Asset_name = ""
    endif
] % %
<
script runat = "server" >
    Platform.Load("core", "1.1.5");
var prox = new Script.Util.WSProxy();
/*------------------------------------------------------------------------specifying account ID-------------------------------------------------------------------- */
var MID = Variable.GetValue("@AccountID");
prox.setClientId({
    "ID": MID
});
/*------------------------------------------------------------Fetching campaign name and campaign code-------------------------------------------------------*/
var Campaign_Name1 = Variable.GetValue("@Campaign_Name");
var Campaign_Name = Campaign_Name1.replace(/\s+/g, '-');
var campaign_code = Variable.GetValue("@campaign_code");
var TSD_Name = Campaign_Name + '-' + "TSD";
var asset_name = Variable.GetValue("@Asset_name");
var frontEndMailingName = Variable.GetValue("@Frontend_Mailing_Name");
var frontEndMailingNameList = frontEndMailingName.split(",");

try {
    /*------------------------------------------------------------------------condition to check whether it already created or not----------------------------------------------------*/
    if (asset_name == TSD_Name) {
        Write("Already created");
    } else {
        /*--------------------------------------------------------------- code to  create Triggered send definition ----------------------------------------------------------------------*/
        var TS_DE_Name = Campaign_Name + '-' + "TS_DE";


        var TSD_Name = Campaign_Name + '-' + "TSD";
        /* Asset customer key value*/

        var Email_CustomerKey = frontEndMailingNameList[0];
        var Description = "TriggeredSendDefinition related to campaign " + Campaign_Name;
        /*-----------------------------------------------------------------------------  Object to create triggered send definition -------------------------------------------------------*/
        var TSD = {
            Name: TSD_Name,
            CustomerKey: TSD_Name,
            Description: Description,
            TriggeredSendStatus: "Active",
            SendClassification: {
                CustomerKey: "Default Commercial"
            },
            Email: {
                CustomerKey: Email_CustomerKey
            },
            SendSourceDataExtension: {
                CustomerKey: TS_DE_Name
            }
        }
        /*-------------------------------------------------------------------------- Triggered Send Defination Creation--------------------------------------------------------------------*/
        var res = prox.createItem("TriggeredSendDefinition", TSD);

        if (res.Status == 'OK') {

            var rows = Platform.Function.InsertData("[Campaign Assets DE]", ["Campaign_code", "Campaign_Name", "Asset_Type", "Asset_name", "date_added"], [campaign_code, Campaign_Name, "TriggeredSendDefinition", TSD_Name, Now()]);
            Write("TriggeredSendDefinition name :" + TSD_Name + "----created successfully");

        } else {
            Write("Errored");
            var rows = Platform.Function.InsertData("[Assets Error Log]", ["Campaign_code", "Campaign_Name", "Asset_Type", "Asset_name", "date_added"], [campaign_code, Campaign_Name, "TriggeredSendDefinition", TSD_Name, Now()]);
        }
    }
} catch (e) {
    Write(Stringify(e));
    Write("Errored");
    var rows = Platform.Function.InsertData("[Assets Error Log]", ["Campaign_code", "Campaign_Name", "Asset_Type", "Asset_name", "date_added"], [campaign_code, Campaign_Name, "TriggeredSendDefinition", TSD_Name, Now()]);
}
  </script>
