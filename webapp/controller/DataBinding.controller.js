sap.ui.define([

    //IMPORTANDO CLASSES
    "sap/ui/core/mvc/Controller",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("br.com.gestao.sapfioriappadmin354.controller.DataBinding", {
            onInit: function () {
                
                //CRIANDO OBJETO JSONMODEL
                debugger;
                var jsonModelObj = new sap.ui.model.json.JSONModel();
                jsonModelObj.loadData("dados/Produtos.json");
                this.getView().setModel(jsonModelObj, "Model_Produtos_JSON");

            },

            getRegion: function (event) {
                
                //CRIANDO OBJETO JSONMODEL
                // debugger;
                var regionModel = new sap.ui.model.json.JSONModel();
                regionModel.loadData("dados/Regions.json");
                this.getView().setModel(regionModel, "regionsJSON");

                var regionsForm = this.getView().byId("formRegions");
                regionsForm.bindElement("regionsJSON>/regions/0");

            },

        
        });
    });
