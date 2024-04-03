sap.ui.define([

    //IMPORTANDO CLASSES
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    'sap/m/MessageToast'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, MessageToast) {
        "use strict";

        return Controller.extend("br.com.gestao.sapfioriappadmin354.controller.i18n", {
            onInit: function () {
                // alert("Hello!!");
                // MessageBox.confirm("message");
                // this.changeLanguage();
            },

            createClient: function (){
                // debugger;
                var oResourceBudle = this.getView().getModel("i18n").getResourceBundle(); //Carrega todas as chaves do arquivo i18n

                var client = this.getView().byId("client").getValue();
                var city = this.getView().byId("city").getValue();
                var state = this.getView().byId("state").getValue();
                var message = oResourceBudle.getText("msgClientInfo", [client, city, state]);

                MessageBox.confirm(message);
            
            },

            changeLanguage: function (event) {
                var choiseLanguage = event.getParameters().selectedItem.getKey();
                var locale = choiseLanguage.substring(0, 2);

                var i18nModel = new sap.ui.model.resource.ResourceModel({
                    bundleUrl: "i18n/i18n.properties",
                    bundleLocale: locale,
                    bundleName: "br.com.gestao.sapfioriappadmin354.i18n.i18n_" + choiseLanguage
                });

                this.getView().setModel(i18nModel, "i18n") //Substinui o i18n padrão
                // this.getView().byId("languageSelect").setSelectedKey(locale);
    
            },

           
        });
    });
