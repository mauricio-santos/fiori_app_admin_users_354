sap.ui.define(
    [
        "sap/ui/core/format/NumberFormat"
    ],
    function(NumberFormat) {
      "use strict";

    var Formatter = {
        dateFormat: function(value){
            // debugger;
  
            var oConfiguration = sap.ui.getCore().getConfiguration();
            var oLocale = oConfiguration.getFormatLocale();
            // console.log(oLocale)
            
  
            if(value){
                var year = new Date().getFullYear();
                if (year === 9999){
                    return "";
                }
  
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    style: "short",
                    pattern: (oLocale === "pt-BR") ? "dd/MM/yyyy" : "dd.MM.yyyy"
                });
  
                return oDateFormat.format(new Date(value));
            }else{
                return value;
            }
        },
  
        productStatus: function(status){
            // debugger
            //Apresentar o texto do status medianet a propiedade status do model
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            var key = "status" + status;
  
            try {
                return oBundle.getText(key);
            } catch (err) {
                return;
            }
        },
  
        changeStatus: function(status){
            try {
                switch(status){
                    case "E":
                        return "Success";
                    case "P":
                        return "Warning";
                    case "F":
                        return "Error";
                    default:
                        return "None";
                }
                
  
            } catch (err) {
                return;
            }
        },
  
        changeIcon: function(status){
            try {
                switch(status){
                    case "E":
                        return "sap-icon://sys-enter-2";
                    case "P":
                        return "sap-icon://alert";
                    case "F":
                        return "sap-icon://error";
                    default:
                        return "";
                }                   
            } catch (err) {
                return;
            }
        },
  
        //Formatação de valores decimais
        floatNumber: function(value){
          var numFloat = NumberFormat.getFloatInstance({
            maxFractionDigits: 2,
            minFractionDigits: 2,
            groupingEnabled: true,
            groupingSeparator: ".",
            decimalSeparator: ","
          });
  
          return numFloat.format(value);
        },
        
        //Função para formatação de data para o CRUD
        dateSAP: function (value) {

            if (value) {

                var dateParts = value.split(".");

                var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

                var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({

                    pattern: "yyyy-MM-ddTHH:mm:ss"

                });

                return oDateFormat.format(new Date(dateObject));

            } else {

                return value;

            }

        },
    };

    return Formatter;

}, true);