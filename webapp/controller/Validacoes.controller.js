sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/ValueState",
	"sap/ui/model/json/JSONModel",


], function(Controller, ValueState, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.demo.nav.controller.Validacoes", {

		onInit : function () {

			//O value state é ativado nos objetos que possuem CONSTRAINTS
			//Criando listener para Error
			sap.ui.getCore().attachValidationError(function (event){
				event.getParameter("element").setValueState(ValueState.Error);
			});

			//Criando listener para Sucesso
			sap.ui.getCore().attachValidationSuccess(function (event){
				event.getParameter("element").setValueState(ValueState.Success);
			});

			//Criando model de apoio Json
			var oModel = new JSONModel();
			this.getView().setModel(oModel, "MDL_Produto");

		},

		showModel: function(){
			var oModel = this.getView().getModel("MDL_Produto");
			console.log(oModel.getData());
		}

	});

});