%%[
Set @DEType = QueryParameter("DEtype")
Set @AccountID = QueryParameter("MID")
/*-----------------------------------------------------Fetching details of recent campaign ----------------------------------------------------------------------------------- */
Set @rows = LookupOrderedRows("[Main Campaign DE]",1,"date_added Desc","Flag",1)
  IF rowcount(@rows)>0 then
  Set @campaign_code = Field(Row(@rows,1), 'Campaign_Code')
  Set @Campaign_Name = Field(Row(@rows,1), 'Campaign_Name')
  Set @Start_Date = Field(Row(@rows,1), 'start_Date')
  endif
  /*-----------------------------------------------------Fetching details of recent DataExtension based on campaign code ----------------------------------------------------------------------------------- */
  Set @Assets_Rows = LookupOrderedRows("[Campaign Assets DE]",1,"date_added Desc","Asset_Type","DataExtension","Campaign_code",@campaign_code)
   IF rowcount(@Assets_Rows)>0 then
  Set @Asset_name = Field(Row(@Assets_Rows,1), 'Asset_name')
  else
  Set @Asset_name = ""
  endif
]%%
<script runat="server">
  Platform.Load("core", "1.1.5");
  var MID=Variable.GetValue("@AccountID");
  //Write(MID);
   if(MID){
  var prox = new Script.Util.WSProxy();
  /*------------------------------------------------------------------------specifying account ID to create the dataextension----------------------------------------------------*/

  var Campaign_Name1 =  Variable.GetValue("@Campaign_Name");
  var Campaign_Name = Campaign_Name1.replace(/\s+/g,'-');
  var campaign_code =  Variable.GetValue("@campaign_code");
  var Start_Date =  Variable.GetValue("@Start_Date");
  //Write(Campaign_Name1+Campaign_Name+campaign_code+Start_Date);
  var tempDate=Start_Date.split("/");
  function monthVal(comp){

 var mon = "Jan";
 if(comp == "01"){
 mon = "Jan";
 }else if(comp == "02"){
 mon = "Feb";
 }else if(comp == "03"){
 mon = "Mar";
 }else if(comp == "04"){
 mon = "Apr";
 }else if(comp == "05"){
 mon = "May";
 }else if(comp == "06"){
 mon = "June";
 }else if(comp == "07"){
 mon = "Jul";
 }else if(comp == "08"){
 mon = "Aug";
 }else if(comp == "09"){
 mon = "Sep";
 }else if(comp == "10"){
 mon = "Oct";
 }else if(comp == "11"){
 mon = "Nov";
 }else if(comp == "12"){
 mon = "Dec";
 }
 return mon;
 }


  var date=tempDate[0];

  var month= monthVal(tempDate[1]);
  var year=tempDate[2];
  //Write(date+month+year);
  //Write(year+month);
  var asset_name =  Variable.GetValue("@Asset_name");
   var DEtype =  Variable.GetValue("@DEType");
  var DE_Name = Campaign_Name;
    var TS_DE_Name = Campaign_Name;
  var categoryID='';


  try{

    /*------------------------------------------------------------------------condition to check whether it already created or not----------------------------------------------------*/

    if(asset_name==DE_Name || asset_name==TS_DE_Name){
      Write("Already created");
    }
    else{



   var cols = ["ID","Description","Name","CustomerKey","ContentType"];
    var filter = {
  LeftOperand: {
    Property: "Name",
    SimpleOperator: 'equals',
    Value: "Campaigns"
  },
  LogicalOperator: "AND",
  RightOperand: {
    Property: "ContentType",
    SimpleOperator: 'equals',
    Value: 'dataextension'
  }
};
    var desc = prox.retrieve("DataFolder", cols,filter);
    // Write(Stringify(desc));
    var parent_FolderID= desc.Results[0].ID;

// Write(parent_FolderID+desc.Results[0].ContentType);

    if(desc.Results.length==0){
      var cols = ["ID","Description","Name","CustomerKey"];
      var filter = {
        Property: "Name",
        SimpleOperator: "equals",
        Value: "Data Extensions"
      };
      var resp  = prox.retrieve("DataFolder", cols,filter);
      parent_FolderID= resp.Results[0].ID;

      var obj={
        Name:"Campaigns",
        CustomerKey:"Campaigns",
        ParentFolder:{
          ID:parent_FolderID
        }
        ,
        Description : "Folder related to campaigns",
        ContentType : "dataextension",
        IsActive : "true",
        IsEditable : "true",
        AllowChildren : "true"
      };
      var res = prox.createItem("DataFolder", obj);

      if(res.Status=='OK'){
        parent_FolderID=res.Results[0].NewID;
        Write(parent_FolderID);
      }
     var obj={
        Name:year,
        CustomerKey:"Campaigns"+year,
        ParentFolder:{
          ID:parent_FolderID
        }
        ,
        Description : "Folder related to campaigns",
        ContentType : "dataextension",
        IsActive : "true",
        IsEditable : "true",
        AllowChildren : "true"
      };
      var res = prox.createItem("DataFolder", obj);

      if(res.Status=='OK'){
        parent_FolderID=res.Results[0].NewID;
        Write(parent_FolderID);
      }

       var obj={
        Name:month,
        CustomerKey:"Campaigns"+month,
        ParentFolder:{
          ID:parent_FolderID
        }
        ,
        Description : "Folder related to campaigns",
        ContentType : "dataextension",
        IsActive : "true",
        IsEditable : "true",
        AllowChildren : "true"
      };
      var res = prox.createItem("DataFolder", obj);

      if(res.Status=='OK'){
        parent_FolderID=res.Results[0].NewID;
        Write(parent_FolderID);
      }

    }

 else{
   var cols = ["ID","Description","Name","CustomerKey"];
   var filter = {
    LeftOperand: {
        Property: "Name",
        SimpleOperator: "equals",
        Value: year
    },
    LogicalOperator: "AND",
    RightOperand: {
        Property: "ParentFolder.ID",
        SimpleOperator: "equals",
        Value: parent_FolderID
    }
};
    var desc = prox.retrieve("DataFolder", cols,filter);


  if(desc.Results.length==0){
    var obj={
        Name:year,
        CustomerKey:"Campaigns"+year,
        ParentFolder:{
          ID:parent_FolderID
        }
        ,
        Description : "Folder related to campaigns",
        ContentType : "dataextension",
        IsActive : "true",
        IsEditable : "true",
        AllowChildren : "true"
      };
      var res = prox.createItem("DataFolder", obj);

      if(res.Status=='OK'){
        parent_FolderID=res.Results[0].NewID;
        Write(parent_FolderID);
      }
   var obj={
        Name:month,
        CustomerKey:"Campaigns"+month,
        ParentFolder:{
          ID:parent_FolderID
        }
        ,
        Description : "Folder related to campaigns",
        ContentType : "dataextension",
        IsActive : "true",
        IsEditable : "true",
        AllowChildren : "true"
      };
      var res = prox.createItem("DataFolder", obj);

      if(res.Status=='OK'){
        parent_FolderID=res.Results[0].NewID;
        Write(parent_FolderID);
      }

  }

  else{
    var parent_FolderID= desc.Results[0].ID;

  var cols = ["ID","Description","Name","CustomerKey"];
   var filter = {
    LeftOperand: {
        Property: "Name",
        SimpleOperator: "equals",
        Value: month
    },
    LogicalOperator: "AND",
    RightOperand: {
        Property: "ParentFolder.ID",
        SimpleOperator: "equals",
        Value: parent_FolderID
    }
};
    var desc = prox.retrieve("DataFolder", cols,filter);

  if(desc.Results.length==0){
    var obj={
        Name:month,
        CustomerKey:"Campaigns"+month,
        ParentFolder:{
          ID:parent_FolderID
        }
        ,
        Description : "Folder related to campaigns",
        ContentType : "dataextension",
        IsActive : "true",
        IsEditable : "true",
        AllowChildren : "true"
      };
      var res = prox.createItem("DataFolder", obj);

      if(res.Status=='OK'){
        parent_FolderID=res.Results[0].NewID;
        Write(parent_FolderID);
      }

  }

    var parent_FolderID= desc.Results[0].ID;

 }
 }

     //Write(parent_FolderID);
    var FolderName= Campaign_Name;
    var randomID = Platform.Function.GUID();
    var obj1={
      Name:FolderName,
      CustomerKey:randomID,
      ParentFolder:{
        ID:parent_FolderID
      }
      ,
      Description : "Folder related to campaigns",
      ContentType : "dataextension",
      IsActive : "true",
      IsEditable : "true",
      AllowChildren : "true"
    };
    var result = prox.createItem("DataFolder", obj1);
    Write(Stringify(result));
    if(result.Status=='OK'){
      categoryID= result.Results[0].NewID;
    }

         if(DEtype=="NormalDE"){
      /*---------------------------------------------------------------- Object to create DE---------------------------------------- */

   function createDataExtension(findFolderID,finalDEName){
var prox = new Script.Util.WSProxy();

var SendableDataExtensionField = {"Name": "contact_record_ID", "DataType": "Text"};
var SendableSubscriberField = {"Name": "Subscriber Key"};
var Description = "DE related to campaign ";

var de = {
Name: finalDEName,
CustomerKey: finalDEName,
Description: Description,
IsSendable :true,
Fields: [
{
FieldType: "Text",
Name: "contact_record_ID",
MaxLength: 255,
IsPrimaryKey: true,
IsNillable: false,
IsRequired: true
},
{
FieldType: "Text",
Name: "first_name",
MaxLength: 255,
IsPrimaryKey: false,
IsNillable: false,
IsRequired: false
},
{
FieldType: "Text",
Name: "last_name",
MaxLength: 255,
IsPrimaryKey: false,
IsNillable: false,
IsRequired: false
},
{
FieldType: "EmailAddress",
Name: "email",
MaxLength: 254,
IsPrimaryKey: false,
IsNillable: false,
IsRequired: false
},
{
FieldType: "Text",
Name: "phone",
MaxLength: 255,
IsPrimaryKey: false,
IsNillable: false,
IsRequired: false
},
{
FieldType: "Text",
Name: "optin_status",
MaxLength: 255,
IsPrimaryKey: false,
IsNillable: false,
IsRequired: false
},
{
FieldType: "Text",
Name: "email_after_sales",
MaxLength: 255,
IsPrimaryKey: false,
IsNillable: false,
IsRequired: false
},
{
FieldType: "Text",
Name: "email_offers",
MaxLength: 255,
IsPrimaryKey: false,
IsNillable: false,
IsRequired: false
},
{
FieldType: "Text",
Name: "hybris_id",
MaxLength: 500,
IsPrimaryKey: false,
IsNillable: false,
IsRequired: true
}


],
IsSendable :true,
SendableDataExtensionField :SendableDataExtensionField,
SendableSubscriberField :SendableSubscriberField,

CategoryID: findFolderID
}
/*-------------------------------------------------------------------------Create Dataextension---------------------------------*/
var res = prox.createItem("DataExtension", de);
return "created";
}

       var created = createDataExtension(categoryID,DE_Name);
      /*creates without Error*/
      if(created=='created'){
       var rows = Platform.Function.InsertData("[Campaign Assets DE]",["Campaign_code","Campaign_Name","Asset_Type","Asset_name","date_added"],[campaign_code,Campaign_Name,"DataExtension",DE_Name,Now()]);
        Write("Dataextension name :"+DE_Name+"----created successfully");
      }
        else{
          Write("Errored");
          var rows = Platform.Function.InsertData("[Assets Error Log]",["Campaign_code","Campaign_Name","Asset_Type","Asset_name","date_added"],[campaign_code,Campaign_Name,"DataExtension",DE_Name,Now()]);
        }
      }
    else{
      var Description = "TriggeredSendDataExtension related to campaign "+Campaign_Name;
        /*-------------------------------------------------------------------------Fetching TriggetedsendDataextension Template ID --------------------------------*/
       var cols = ["ObjectID","Name","CustomerKey"];
   var filter = {
      Property: "Name",
      SimpleOperator: "equals",
      Value: "TriggeredSendDataExtension"
    };
    var res = prox.retrieve("DataExtensionTemplate", cols,filter);
   Write(Stringify(res));
  var ObjectId='';
  if(res.Status=='OK'){
        ObjectId=res.Results[0].ObjectID;
      }
 //Write(ObjectId);

       /*---------------------------------------------------------------- Object to create TriggeredDE---------------------------------------- */
      var TriggeredDE = {
        Name: TS_DE_Name,
        CustomerKey: TS_DE_Name,
        Description: Description,
        SendableDataExtensionField:{
          Name:"SubscriberKey",
          FieldType:"EmailAddress"
        }
        ,
        SendableSubscriberField:{
          Name:"SubscriberKey"
        }
        ,
        Template:{
          ObjectID:ObjectId
        }
        ,
        Fields: [
           {
            FieldType: "Text",
            Name: "First_Name",
            MaxLength: 100,
            IsPrimaryKey: false,
            IsRequired: false
          },
    {
            FieldType: "Text",
            Name: "Last_Name",
            MaxLength: 100,
            IsPrimaryKey: false,
            IsRequired: false
          },
    {
            FieldType: "Text",
            Name: "Email",
            MaxLength: 100,
            IsPrimaryKey: false,
            IsRequired: false
          },
    {
            FieldType: "Text",
            Name: "Phone",
            MaxLength: 100,
            IsPrimaryKey: false,
            IsRequired: false
          },
    {
            FieldType: "Text",
            Name: "Optin_Status",
            MaxLength: 100,
            IsPrimaryKey: false,
            IsRequired: false
          },
    {
            FieldType: "Text",
            Name: "Email_AfterSales",
            MaxLength: 100,
            IsPrimaryKey: false,
            IsRequired: false
          },
    {
            FieldType: "Text",
            Name: "Email_Offer",
            MaxLength: 100,
            IsPrimaryKey: false,
            IsRequired: false
          },

    {
            FieldType: "Text",
            Name: "Owner_Segment",
            MaxLength: 100,
            IsPrimaryKey: false,
            IsRequired: false
          }
        ],
        CategoryID: categoryID
      }
        /*-------------------------------------------------------------------------Create Dataextension---------------------------------*/
      var res = prox.createItem("DataExtension", TriggeredDE);
      /*creates without Error*/
      if(res.Status=='OK'){
        var rows = Platform.Function.InsertData("[Campaign Assets DE]",["Campaign_code","Campaign_Name","Asset_Type","Asset_name","date_added"],[campaign_code,Campaign_Name,"DataExtension",TS_DE_Name,Now()]);
        Write("Dataextension name :"+TS_DE_Name+"----created successfully");
      }
      else{
         var rows = Platform.Function.InsertData("[Assets Error Log]",["Campaign_code","Campaign_Name","Asset_Type","Asset_name","date_added"],[campaign_code,Campaign_Name,"DataExtension",TS_DE_Name,Now()]);
         Write("Errored");

      }
      }
    }


    }

  catch(e){
    if(DEtype=="NormalDE"){
    var rows = Platform.Function.InsertData("[Assets Error Log]",["Campaign_code","Campaign_Name","Asset_Type","Asset_name","date_added"],[campaign_code,Campaign_Name,"DataExtension",DE_Name,Now()]);
    }
    else{
       var rows = Platform.Function.InsertData("[Assets Error Log]",["Campaign_code","Campaign_Name","Asset_Type","Asset_name","date_added"],[campaign_code,Campaign_Name,"DataExtension",TS_DE_Name,Now()]);
    }
    Write(Stringify(e));
  }

}else{
Write("MID is empty");
}




</script>
