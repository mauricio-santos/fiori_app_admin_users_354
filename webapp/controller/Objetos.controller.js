sap.ui.define([

    //IMPORTANDO CLASSES
    "sap/ui/core/mvc/Controller",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/TextArea",

    "sap/ui/layout/form/SimpleForm"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Label, Input, TextArea, SimpleForm) {
        "use strict";

        return Controller.extend("br.com.gestao.sapfioriappadmin354.controller.Objetos", {
            onInit: function () {
                // alert("Hello!!");
            },

            onClickSet: function(event){
                // debugger;
                var headerTitle1 = this.getView().byId("headerTitle1");
                headerTitle1.setText("Título alterdo pelo botão");
            },

            onClickGet: function(event){
                // debugger;
                var headerTitle1 = this.getView().byId("headerTitle1");
                var s = headerTitle1.getText();
                alert(s);
            },

            createForm: function(event){
                // debugger;
                var panel1 = this.getView().byId("panel1");
                panel1.destroyContent();
               
                var arrItemsForm = [];

                //INPUT 1
                arrItemsForm.push(new Label("lbFirstName", {
                    text:"Vorname",
                }));
                arrItemsForm.push(new Input("inpFirstName", {
                    value:"Wie ist deine Vorname?",
                    required: true,
                }));

                //INPUT 2
                arrItemsForm.push(new Label("lbLastName", {
                    text:"Nachname",
                }));
                arrItemsForm.push(new Input("inpLastName", {
                    value:"Wie ist deine Nachname?",
                    required: false,
                }));

                //TEXTAREA
                arrItemsForm.push(new Label("lbMessage", {
                    text:"Nachrichten",
                }));
                arrItemsForm.push(new TextArea("textArea", {
                    rows: 7,
                    // cols: 25,
                }));


                var newForm = new SimpleForm("newSimpleForm", {
                    //content recebe uma coleção de objetos
                    content: arrItemsForm
                });
                panel1.addContent(newForm);
            },
        });
    });
