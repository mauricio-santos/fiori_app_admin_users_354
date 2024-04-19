sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "br/com/gestao/sapfioriappusers354/util/Formatter",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState",
    "sap/ui/model/json/JSONModel",
    "br/com/gestao/sapfioriappusers354/util/Validator",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
    "sap/ui/model/odata/ODataModel",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, Formatter, Fragment, ValueState, JSONModel, Validator, MessageBox, BusyDialog, ODataModel, MessageToast) {
        "use strict";

        return Controller.extend("br.com.gestao.sapfioriappusers354.controller.Lista", {

            //Usando funções do arquivo Formatter.js
            objFormat: Formatter,

            onInit: function () {
                // let oConfiguration = sap.ui.getCore().getConfiguration();
                // oConfiguration.setFormatLocale("pt-BR");

                sap.ui.getCore().attachValidationError(function (event){
                    event.getParameter("element").setValueState(ValueState.Error);
                });
    
                //Criando listener para Sucesso
                sap.ui.getCore().attachValidationSuccess(function (event){
                    event.getParameter("element").setValueState(ValueState.Success);
                });

            },

            createModel: function(){
                //Model Produto
                let oModel = new JSONModel();
                this.getView().setModel(oModel, "MDL_User");
            },

            onSearch: function(event){

                //Capturando os inputs do filterbar
                let oUserId = this.byId("userIdInput").getValue();
                let oUserFirstName = this.byId("userNameInput").getValue();
                let oUserEmail = this.byId("emailInput").getValue();

                let objFilter = {filters: [], and: true};
                if(oUserId){
                    objFilter.filters.push(new Filter("Userid", FilterOperator.EQ, oUserId));
                }

                if(oUserFirstName){
                    objFilter.filters.push(new Filter("Firstname", FilterOperator.Contains, oUserFirstName));
                }

                if(oUserEmail){
                    objFilter.filters.push(new Filter("Email", FilterOperator.Contains, oUserEmail));
                }

                let oFilter = new Filter(objFilter);

                let oTable = this.byId("usersTable");
                let binding = oTable.getBinding("items");
                binding.filter(oFilter);
            },

            // ########### CRIAR ROTAS EM TEMPO DE EXECUÇÃO ###########
            onRouting: function(){
                // debugger;
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this); //Pega todas as rotas do manifest.json
                oRouter.navTo("RouteDetalhes"); //Redireciona para rota desejada            
            },

            // ########### CRIANDO ROTAS ASSOCIADAS A ÍTENS DA LISTA ###########
            onSelectedUser: function(event){
                // debugger;

                // Capturando id do objeto no evento
                let oUserId = event.getSource().getBindingContext().getProperty("Userid");
                
                // Redirecionando para detalhes com o parâmetro
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteDetalhes", {
                    userId: oUserId
                });          
            },

            // ########### CRIAR MATCH CODE - FRAGMENTS ###########

            onCategory: function(event){
                //Criando propiedade _oIpunt e capturando o id do input que o chamou
                this._oInput = event.getSource().getId();

                //capturando a view
                let oView = this.getView();

                // debugger;

                // Verificando se o objeto fragment existe. senão cria e adiciona na view
                // this._CategorySearchHelp é o objeto que armazena o match code
                if(!this._CategorySearchHelp){
                    //Carregamento do fragmento
                    this._CategorySearchHelp = Fragment.load({
                        id: oView.getId(),
                        //Namespace do fragmento
                        name: "br.com.gestao.sapfioriappusers354.frags.SH_Categories",
                        controller: this
                    }).then(function(oDialog){
                        //oDialog corresponde ao fragment (_CategorySearchHelp) recém criado
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }

                this._CategorySearchHelp.then(function(oDialog){
                    //Limpando o filtro de categorias
                    oDialog.getBinding("items").filter([]);

                    //Abertura do fragmento
                    oDialog.open();

                });
            },

            //Mostrando lista de Categorias
            onValueHelpSearch: function(event){

                //Capturando string digitada
                let sValue = event.getParameter("value");
                
                // Opção 1 - Criando um único objeto filtro
                //Criando um filtro e buscando resultado
                // let oFilter = new Filter("Description", FilterOperator.Contains, sValue);
                // event.getSource().getBinding("items").filter([oFilter]);

                // Opção 2 - Criando um objeto dinâmico onde poderá adicionar várias propiedades
                let objFilter = {filters: [], and: false};

                //Criação dos filtros de Descrição e ID da Categoria
                objFilter.filters.push(new Filter("Description", FilterOperator.Contains, sValue));
                objFilter.filters.push(new Filter("Category", FilterOperator.Contains, sValue));

                let oFilter = new Filter(objFilter);
                event.getSource().getBinding("items").filter(oFilter);
            },

            onValueHelpClose: function(event){
                // debugger
                let oSelectedItem = event.getParameter("selectedItem");
                let oInput = null;

                if(this.byId(this._oInput)){
                    oInput = this.byId(this._oInput);
                }else{
                    oInput = sap.ui.getCore().byId(this._oInput);
                }

                if(!oSelectedItem){
                    oInput.resetProperty("value");
                    return;
                }

                oInput.setValue(oSelectedItem.getTitle());
            },

            // ########### CRUD ###########
            onCreateUser: function(event){
                debugger;
                //capturando a view

                //cria o model MDL_User vazio
                this.createModel();

                let oView = this.getView();

                let t = this;

                if(!this._User){
                    //Carregamento do fragmento
                    this._User = Fragment.load({
                        id: oView.getId(),
                        name: "br.com.gestao.sapfioriappusers354.frags.CreateUser",
                        controller: this
                    }).then(function(oDialog){
                        //oDialog corresponde ao fragment (_User) recém criado
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }

                this._User.then(function(oDialog){
                    oDialog.open();

                    //Chamada da função para pegar os usuários
                    t.onGetUsers();

                    // t.getReadOpcoes();

                });
            },
            onValidation: function(){
                //Criação do objeto validator
                let validator = new Validator(); //A validação acontece nas CONSTRAINTS

                //Checagem davalidação
                if(validator.validate(this.byId("dialogModal"))){
                    // alert("Tudo OK!");
                    this.onInsert();
                }
            },

            // ########### CREATE ###########
            onInsert: function(){
                debugger
                //Capturando o modelo
                let oModelProduct = this.getView().getModel("MDL_User");

                //Capturando o objeto do modelo de produto
                let oUserSAP = oModelProduct.getData();

                // //Realizando manipulações de dados do produto
                // oUserSAP.Userid = oUserSAP.Userid;
                // oUserSAP.Price = oUserSAP.Price[0].toString();
                // oUserSAP.Createdat = this.objFormat.dateSAP(oUserSAP.Createdat);
                // oUserSAP.Currencycode = "EUR";
                // oUserSAP.Userupdate = "";
                // oUserSAP.Weightmeasure = oUserSAP.Weightmeasure.toString();
                // oUserSAP.Width = oUserSAP.Width.toString();
                // oUserSAP.Height = oUserSAP.Height.toString();
                // oUserSAP.Depth = oUserSAP.Depth.toString();

                //Criando uma referência do arquivo i18n
                let bundle = this.getView().getModel("i18n").getResourceBundle(); //possue todas as chaves do arquivo i18n
                let successMsg = bundle.getText("insertDialogSuccess", [oUserSAP.Userid]);
               
                //letiável de contexto da view
                let t = this;
                
                //Model de referência do model default (OData - mainservice) para enviar as informações para o SAP
                oModelProduct = this.getView().getModel();
                let oDataServiceUrl = oModelProduct.sServiceUrl;

                MessageBox.confirm(
                    bundle.getText("insertDialogMsg"), //Pegunta do dialogo

                    function(selectedOption){ //Função de disparo do botão Criar
                        //Verificando se deseja confirmar a ação de inclusão OK/CANCELL
                        if(MessageBox.Action.OK === selectedOption){

                            //criando um diálogo de ocupado dentro de um atributo (_oBusyDialog) criado dinâmicamente
                            t._oBusyDialog = new BusyDialog({
                                text: bundle.getText("loading")
                            });

                            //abrindo o diálogo de carregamento
                            t._oBusyDialog.open();

                            //definindo um tempo de duração do diálogo de carregamento que será iniciado ao realizar a inserção
                            setTimeout(
                                // 1 Parâmetro do setTimeout
                                function(){

                                    //Realizar a chamada oData do serviço SAP
                                    let oModelSend = new ODataModel(oDataServiceUrl, true);

                                    //Criar produto a partir do objeto
                                    oModelSend.create(
                                        "Users", //Nome da entidade
                                        oUserSAP, //Objeto com os dados para inclusão
                                        null, //Parâmetros de credênciais

                                        //Função de retorno de SUCESSO
                                        function(request, response){ 
                                            if(response.statusCode === 201){ //Criado com sucesso
                                                //Geração de messagem TOAST de SUCESSO com a chave do arquivo i18n
                                                MessageToast.show(
                                                    successMsg,{
                                                        //Agregações
                                                        duration: 4000 //Toast Menssage dura 4s
                                                    }                                                                                      
                                                );

                                                //Fechar o objeto dialog do fragment
                                                t.dialogClose();
                                                //reset o model default para nova inclusão. Atualiza a página.
                                                t.getView().getModel().refresh();
                                                //fechar o BusyDialog
                                                t._oBusyDialog.close();
                                            }
                                        },// FIM Função de retorno de SUCESSO

                                        //Função de retorno de ERRO
                                        function(e){ 
                                                //fechar o BusyDialog
                                                t._oBusyDialog.close(); 

                                                //Convertendo o erro para formato JSON
                                                let oReturn = JSON.parse(e.response.body);
                                                let errorJSONMsg = oReturn.error.message.value;
                                                
                                                //Gerando mensagem TOAST para o erro
                                                MessageToast.show(
                                                    errorJSONMsg,{
                                                        duration: 4000 //Toast Menssage dura 4s
                                                    }                                                                                      
                                                );                                                                                  
                                        },// FIM Função de retorno de ERRO
                                    ); //Fim da função create
                                },2000 //2s - Duração da página de carregamento
                            ); // FIM setTimeout
                        } //FIM IF STATUS OK
                    //FIM função do diálogo
                    }, bundle.getText("insertDialogTitle"),// Título do diálogo 
                );//FIM MessageBox
            }, //FIM função onInsert

            //Gerador de ID aleatório bia-a-bit
            getRandomId: function(){
                //  /[xy]/g - é uma expressão regular que corresponde a um único caractere xou yà string original.
                // replace(..) substituirá todas as substrings que correspondem ao regex ('x' ou 'y') por outra string usando a função fornecida.

                return 'xxxxxxxxxx'.replace(/[xy]/g, function (c) {

                    let r = Math.random() * 16 | 0,

                        //Operações BIT a BIT
                        v = c == 'x' ? r : (r & 0x3 | 0x8);

                    return v.toString(16).toUpperCase();

                });
            },

            // Fechamento do dialogo do fragment do CreateUser
            dialogClose: function(){
                this._User.then(function(oDialog){
                    oDialog.close();

                });
            },
            // ########### READ ###########
            //Capturando a coleção de usuários de um novo serviço OData
            onGetUsers: function(){
                let t = this;
                let entityURL = "/sap/opu/odata/sap/ZSB_USERS_354"; //URL do serviço
                let oModelSend = new ODataModel(entityURL, true);

                oModelSend.read("/Users", {
                    success: function(oData, results){

                        if(results.statusCode === 200){
                            let oModelUsers = new JSONModel();
                            oModelUsers.setData(oData.results);
                            t.getView().setModel(oModelUsers, "MDL_Users");
                        }

                    },
                    error: function(e){      
                        //Convertendo o erro para formato JSON
                        let oReturn = JSON.parse(e.response.body);
                        let errorJSONMsg = oReturn.error.message.value;     

                        //Gerando mensagem TOAST para o erro
                        MessageToast.show(
                            errorJSONMsg,{
                                duration: 4000 //Toast Menssage dura 4s
                            }                                                                                      
                        );                                

                    }
                });
            },

            //Capturando fornecedor por meio do evento de mudança
            getSupplier: function(event){
                // debugger
                this._oInput = event.getSource().getId();
                let oValue = event.getSource().getValue();

                //URL de chamada de um fornecedor
                let sElement = "/Suppliers('" + oValue + "')"; //Suppliers('1000109')

                //Cria o objeto model default
                let oModel = this.getView().getModel();

                //Model onde o usuário realiza o preenchimento das informações de produtos
                let oModelMDLProduct = this.getView().getModel("MDL_User");

                //Realizar a chamada para o SAP
                let oModelSend = new ODataModel(oModel.sServiceUrl, true);

                oModelSend.read(sElement, {
                    success: function(oData, results){

                        if(results.statusCode === 200){
                            oModelMDLProduct.setProperty("/Supplierid", oData.Lifnr);
                            oModelMDLProduct.setProperty("/Suppliername", oData.Name1);

                        }

                    },
                    error: function(e){      
                        oModelMDLProduct.setProperty("/Supplierid", "");
                        oModelMDLProduct.setProperty("/Suppliername", "");

                        //Convertendo o erro para formato JSON
                        let oReturn = JSON.parse(e.response.body);    

                        //Gerando mensagem TOAST para o erro
                        MessageToast.show(
                            oReturn.error.message.value,{
                                duration: 4000 //Toast Menssage dura 4s
                            }                                                                                      
                        );                                

                    }
                });

            },

            //Sugestão de fornecedores
            onSugest: function(event){
                let sText = event.getParameter("suggestValue");
                let aFilters = [];

                if (sText){
                    aFilters.push(new Filter("Lifnr", FilterOperator.Contains, sText));
                }

                event.getSource().getBinding("suggestionItems").filter(aFilters);
            },


            getReadOpcoes: function () {
                // debugger;
                // Item 1 - Chamada via URL
                var sElement = "/Products";
                //var sElement = "/Products('CE9EE27E11')";
                //var sElement = "/Products('CE9EE27E11')/to_cat";

                //Criando filtros em tempo de execução
                var afilters = [];
                afilters.push(new Filter("Status", FilterOperator.EQ, 'E'));
                afilters.push(new Filter("Category", FilterOperator.EQ, 'COMP'));

                // Cria o objeto model default 
                var oModel = this.getView().getModel();

                // Realizar a chamada para o SAP
                var oModelSend = new ODataModel(oModel.sServiceUrl, true);

                oModelSend.read(sElement, {
                    //Parâmetro de filtros
                    filters: afilters,
                    urlParameters: { //Retorna o registro com as informações da categoria (opcional)
                        $expand: "to_cat"
                    },
                    success: function(oData, results){
                        if(results.statusCode === 200){

                        }

                    },
                    error: function(e){      
                        //Convertendo o erro para formato JSON
                        let oReturn = JSON.parse(e.response.body);    

                        //Gerando mensagem TOAST para o erro
                        MessageToast.show(
                            oReturn.error.message.value,{
                                duration: 4000 //Toast Menssage dura 4s
                            }                                                                                      
                        );                                

                    }
                });
            }


        });
    });
