sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/NumberFormat",
    "br/com/gestao/sapfioriappusers354/util/Formatter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "br/com/gestao/sapfioriappusers354/util/Validator",
    "sap/ui/core/ValueState",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
  ],
  function (BaseController, NumberFormat, Formatter, Fragment, JSONModel, ODataModel, Filter, FilterOperator, MessageToast, Validator, ValueState, MessageBox, BusyDialog) {
    "use strict";

    return BaseController.extend("br.com.gestao.sapfioriappusers354.controller.Detalhes", {

      //Usando funções do arquivo Formatter.js
      objFormat: Formatter,

      onInit: function () {

        sap.ui.getCore().attachValidationError(function (event) {
          event.getParameter("element").setValueState(ValueState.Error);
        });

        //Criando listener para Sucesso
        sap.ui.getCore().attachValidationSuccess(function (event) {
          event.getParameter("element").setValueState(ValueState.Success);
        });

        // debugger;
        // CRIANDO OBJETO ROUTE
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        // ACOPLANDO A FUNÇÃO QUE FARÁ O bindingElement
        oRouter.getRoute("RouteDetalhes").attachMatched(this.onBindingProdutoDetalhes, this);

        //Chamar função para realizar o carregamento dos fragments iniciais
        this._formFragments = {}
        //Função que armazenam o nome do fragmento e o VBox correspondente
        this._showFormFragments("DisplayBasicInfo", "vBoxViewBasicInfo");
        this._showFormFragments("DisplayTechInfo", "vBoxViewTechInfo");

      },

      //Função que recebe o nome do fragment e o nome do vbox de destino
      _showFormFragments: function (fragmentName, vBoxName) {
        //Referência do VBox
        let objVBox = this.byId(vBoxName);

        //Remover todos os objetos que já estão preenchidos
        objVBox.removeAllItems();

        //Alimentando o VBox com o novo conteúdo
        this._getFormAllItems(fragmentName).then(function (oVBox) {
          objVBox.insertItem(oVBox);
        });

      },

      // Função que cria o objeto fragment baseado no nome e adiciona em um objeto com uma coleção de fragments
      _getFormAllItems: function (fragmentName) {
        let oFormFragment = this._formFragments[fragmentName];
        let oView = this.getView();

        if (!oFormFragment) {
          oFormFragment = Fragment.load({
            id: oView.getId(),
            name: "br.com.gestao.sapfioriappusers354.frags." + fragmentName,
            controller: this
          });

          this._formFragments[fragmentName] = oFormFragment;
        }

        return oFormFragment;

      },

      onBindingProdutoDetalhes: function (event) {
        // debugger;
        //CAPTURANDO O PARÂMETRO TRAFEGADO NO RouteDetalhes (productId)
        var productId = event.getParameter("arguments").productId;

        // Objeto referente a view Detalhes
        var oView = this.getView();

        //Criar um parâmetro de controle para redirecionamento da view após o Delete
        this._bDelete = false;


        // Criar URL de chamada da entidade Products
        var sURL = "/Products('" + productId + "')";

        // Fazendo o bindingElement
        oView.bindElement({
          path: sURL,
          parameters: { expand: 'to_cat' },
          events: {
            change: this.onBindingChange.bind(this), //Validando id do produto
            dataRequested: function () {
              // debugger
              oView.setBusy(true)
            },
            dataReceived: function (data) {
              // debugger
              oView.setBusy(false)
            }
          }
        });
      },

      //Validando o id do produto
      onBindingChange: function (event) {
        // debugger;
        var oView = this.getView();
        var oElementBinding = oView.getElementBinding();
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        //Se o produto não existir
        if (!oElementBinding.getBoundContext()) {

          //Se não exitir o registro e não estamos na operação de delete, será redirecionado
          if (!this._bDelete) {
            //redirecionando para a página de erro
            oRouter.getTargets().display("TargetObjNotFound");
            return;
          }
        } else {
          //Clonamos o registro atual
          this._oProduto = Object.assign({}, oElementBinding.getBoundContext().getObject());
        }
      },

      createModel: function () {
        //Model Produto
        let oModel = new JSONModel();
        this.getView().setModel(oModel, "MDL_Produto");
      },

      onNavBack: function () {

        //Desabilita a edição
        this._habilitaEdicao(false);

        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouteLista");
      },

      handleEditPress: function () {
        //criamos nosso model MDL_Produto
        this.createModel();

        //Atribui no objeto model o registro clonado
        let oModelProduto = this.getView().getModel("MDL_Produto");
        oModelProduto.setData(this._oProduto);

        //recuperar os usuário
        this.onGetUsers();

        //Habilita a edição
        this._habilitaEdicao(true);
      },

      handleCancelPress: function () {
        //Restaurar o registro atual do model
        let oModel = this.getView().getModel();
        oModel.refresh(true);

        //Modo de somente leitura
        this._habilitaEdicao(false);
      },

      _habilitaEdicao: function (bEdit) {
        let oView = this.getView();
        debugger;

        //Botoões de ações
        oView.byId("btnEdit").setVisible(!bEdit);
        oView.byId("btnDelete").setVisible(!bEdit);
        oView.byId("btnSave").setVisible(bEdit);
        oView.byId("btnCancel").setVisible(bEdit);

        // Ativar/Desativar Sessões das páginas
        oView.byId("basicInfoSection").setVisible(!bEdit);
        oView.byId("techInfoSection").setVisible(!bEdit);
        oView.byId("editSection").setVisible(bEdit);

        if (bEdit) {
          this._showFormFragments("Change", "vBoxChangeProduct");
        } else {
          this._showFormFragments("DisplayBasicInfo", "vBoxViewBasicInfo");
          this._showFormFragments("DisplayTechInfo", "vBoxViewTechInfo");
        }
      },

      onGetUsers: function () {
        let t = this;
        let entityURL = "/sap/opu/odata/sap/ZSB_USERS_354"; //URL do serviço
        let oModelSend = new ODataModel(entityURL, true);

        oModelSend.read("/Users", {
          success: function (oData, results) {

            if (results.statusCode === 200) {
              let oModelUsers = new JSONModel();
              oModelUsers.setData(oData.results);
              t.getView().setModel(oModelUsers, "MDL_Users");
            }

          },
          error: function (e) {
            //Convertendo o erro para formato JSON
            let oReturn = JSON.parse(e.response.body);
            let errorJSONMsg = oReturn.error.message.value;

            //Gerando mensagem TOAST para o erro
            MessageToast.show(
              errorJSONMsg, {
              duration: 4000 //Toast Menssage dura 4s
            }
            );

          }
        });
      },
      onCategory: function (event) {
        //Criando propiedade _oIpunt e capturando o id do input que o chamou
        this._oInput = event.getSource().getId();

        //capturando a view
        let oView = this.getView();

        // debugger;

        // Verificando se o objeto fragment existe. senão cria e adiciona na view
        // this._CategorySearchHelp é o objeto que armazena o match code
        if (!this._CategorySearchHelp) {
          //Carregamento do fragmento
          this._CategorySearchHelp = Fragment.load({
            id: oView.getId(),
            //Namespace do fragmento
            name: "br.com.gestao.sapfioriappusers354.frags.SH_Categories",
            controller: this
          }).then(function (oDialog) {
            //oDialog corresponde ao fragment (_CategorySearchHelp) recém criado
            oView.addDependent(oDialog);
            return oDialog;
          });
        }

        this._CategorySearchHelp.then(function (oDialog) {
          //Limpando o filtro de categorias
          oDialog.getBinding("items").filter([]);

          //Abertura do fragmento
          oDialog.open();

        });
      },
      //Mostrando lista de Categorias
      onValueHelpSearch: function (event) {

        //Capturando string digitada
        let sValue = event.getParameter("value");

        // Opção 1 - Criando um único objeto filtro
        //Criando um filtro e buscando resultado
        // let oFilter = new Filter("Description", FilterOperator.Contains, sValue);
        // event.getSource().getBinding("items").filter([oFilter]);

        // Opção 2 - Criando um objeto dinâmico onde poderá adicionar várias propiedades
        let objFilter = { filters: [], and: false };

        //Criação dos filtros de Descrição e ID da Categoria
        objFilter.filters.push(new Filter("Description", FilterOperator.Contains, sValue));
        objFilter.filters.push(new Filter("Category", FilterOperator.Contains, sValue));

        let oFilter = new Filter(objFilter);
        event.getSource().getBinding("items").filter(oFilter);
      },

      onValueHelpClose: function (event) {
        // debugger
        let oSelectedItem = event.getParameter("selectedItem");
        let oInput = null;

        if (this.byId(this._oInput)) {
          oInput = this.byId(this._oInput);
        } else {
          oInput = sap.ui.getCore().byId(this._oInput);
        }

        if (!oSelectedItem) {
          oInput.resetProperty("value");
          return;
        }
        oInput.setValue(oSelectedItem.getTitle());
      },
      //Capturando fornecedor por meio do evento de mudança
      getSupplier: function (event) {
        // debugger
        this._oInput = event.getSource().getId();
        let oValue = event.getSource().getValue();

        //URL de chamada de um fornecedor
        let sElement = "/Suppliers('" + oValue + "')"; //Suppliers('1000109')

        //Cria o objeto model default
        let oModel = this.getView().getModel();

        //Model onde o usuário realiza o preenchimento das informações de produtos
        let oModelMDLProduct = this.getView().getModel("MDL_Produto");

        //Realizar a chamada para o SAP
        let oModelSend = new ODataModel(oModel.sServiceUrl, true);

        oModelSend.read(sElement, {
          success: function (oData, results) {

            if (results.statusCode === 200) {
              oModelMDLProduct.setProperty("/Supplierid", oData.Lifnr);
              oModelMDLProduct.setProperty("/Suppliername", oData.Name1);

            }

          },
          error: function (e) {
            oModelMDLProduct.setProperty("/Supplierid", "");
            oModelMDLProduct.setProperty("/Suppliername", "");

            //Convertendo o erro para formato JSON
            let oReturn = JSON.parse(e.response.body);

            //Gerando mensagem TOAST para o erro
            MessageToast.show(
              oReturn.error.message.value, {
              duration: 4000 //Toast Menssage dura 4s
            }
            );

          }
        });

      },

      //Sugestão de fornecedores
      onSugest: function (event) {
        let sText = event.getParameter("suggestValue");
        let aFilters = [];

        if (sText) {
          aFilters.push(new Filter("Lifnr", FilterOperator.Contains, sText));
        }

        event.getSource().getBinding("suggestionItems").filter(aFilters);
      },

      validation: function () {
        //Criação do objeto validator
        let validator = new Validator(); //A validação acontece nas CONSTRAINTS

        //Checagem davalidação
        if (validator.validate(this.byId("vBoxChangeProduct"))) {
          debugger
          this.onUpdate();
        }
      },

      // ########### CREATE ###########
      onUpdate: function () {
        debugger
        //Capturando o modelo
        let oModelProduct = this.getView().getModel("MDL_Produto");
        //Capturando o objeto do modelo de produto
        let oProductSAP = oModelProduct.getData();
        let sPath = this.getView().getElementBinding().getPath();

        //Realizando manipulações de dados do produto
        // oProductSAP.Productid = this.getRandomId();
        oProductSAP.Price = oProductSAP.Price.toString();
        // oProductSAP.Createdat = this.objFormat.dateSAP(oProductSAP.Createdat);
        // oProductSAP.Currencycode = "EUR";
        // oProductSAP.Userupdate = "";
        oProductSAP.Weightmeasure = oProductSAP.Weightmeasure.toString();
        oProductSAP.Width = oProductSAP.Width.toString();
        oProductSAP.Height = oProductSAP.Height.toString();
        oProductSAP.Depth = oProductSAP.Depth.toString();
        oProductSAP.Changedat = new Date().toISOString().substring(0, 19); //Data e hora atual

        //Excluindo arquivos
        delete oProductSAP.to_cat;
        delete oProductSAP.__metadata;

        //Criando uma referência do arquivo i18n
        let bundle = this.getView().getModel("i18n").getResourceBundle(); //possue todas as chaves do arquivo i18n

        //letiável de contexto da view
        let t = this;

        //Model de referência do model default (OData - mainservice) para enviar as informações para o SAP
        oModelProduct = this.getView().getModel();
        let oDataServiceUrl = oModelProduct.sServiceUrl;

        MessageBox.confirm(
          bundle.getText("updateDialogMsg", [oProductSAP.Productid]), //Pegunta do dialogo

          function (selectedOption) { //Função de disparo do botão Criar
            //Verificando se deseja confirmar a ação de inclusão OK/CANCELL
            if (MessageBox.Action.OK === selectedOption) {

              //criando um diálogo de ocupado dentro de um atributo (_oBusyDialog) criado dinâmicamente
              t._oBusyDialog = new BusyDialog({
                text: bundle.getText("loading")
              });

              //abrindo o diálogo de carregamento
              t._oBusyDialog.open();

              //definindo um tempo de duração do diálogo de carregamento que será iniciado ao realizar a inserção
              setTimeout(
                // 1 Parâmetro do setTimeout
                function () {

                  //Realizar a chamada oData do serviço SAP
                  let oModelSend = new ODataModel(oDataServiceUrl, true);

                  //Criar produto a partir do objeto
                  oModelSend.update(
                    sPath,
                    oProductSAP, //Objeto com os dados para inclusão
                    null, //Parâmetros de credênciais

                    //Função de retorno de SUCESSO
                    function (request, response) {
                      if (response.statusCode === 204) { //Criado com sucesso
                        //Geração de messagem TOAST de SUCESSO com a chave do arquivo i18n
                        // MessageToast.show(
                        //     successMsg,{
                        //         //Agregações
                        //         duration: 4000 //Toast Menssage dura 4s
                        //     }                                                                                      
                        // );

                        let successMsg = bundle.getText("updateDialogSuccess", [oProductSAP.Productid]);

                        //fechar o BusyDialog
                        t._oBusyDialog.close();

                        //Menssage de sucesso
                        MessageBox.success(bundle.getText(successMsg));

                        //volta para somente leitura
                        t.handleCancelPress();

                        //Fechar o objeto dialog do fragment
                        // t.dialogClose();

                        //reset o model default para nova inclusão. Atualiza a página.
                        // t.getView().getModel().refresh();


                      }
                    },// FIM Função de retorno de SUCESSO

                    //Função de retorno de ERRO
                    function (e) {
                      //fechar o BusyDialog
                      t._oBusyDialog.close();

                      //Convertendo o erro para formato JSON
                      let oReturn = JSON.parse(e.response.body);
                      let errorJSONMsg = oReturn.error.message.value;

                      //Gerando mensagem TOAST para o erro
                      MessageToast.show(
                        errorJSONMsg, {
                        duration: 4000 //Toast Menssage dura 4s
                      }
                      );
                    },// FIM Função de retorno de ERRO
                  ); //Fim da função create
                }, 2000 //2s - Duração da página de carregamento
              ); // FIM setTimeout
            } //FIM IF STATUS OK
            //FIM função do diálogo
          }, bundle.getText("updateDialogTitle"),// Título do diálogo 
        );//FIM MessageBox
      }, //FIM função onInsert


      // ########### CREATE ###########
      onDelete: function () {
        debugger
        // let oProductSAP = oModelProduct.getData();
        let oProductSAP = this.getView().getElementBinding().getBoundContext().getObject(); //Acessando o registro
        let sPath = this.getView().getElementBinding().getPath();
        let bundle = this.getView().getModel("i18n").getResourceBundle(); //possue todas as chaves do arquivo i18n
        let t = this;
        let oModelProduct = this.getView().getModel();
        let oDataServiceUrl = oModelProduct.sServiceUrl;

        let oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        MessageBox.confirm(
          bundle.getText("deleteDialogMsg", [oProductSAP.Productid]), //Pegunta do dialogo

          function (selectedOption) { //Função de disparo do botão Criar
            //Verificando se deseja confirmar a ação de inclusão OK/CANCELL
            if (MessageBox.Action.OK === selectedOption) {

              //criando um diálogo de ocupado dentro de um atributo (_oBusyDialog) criado dinâmicamente
              t._oBusyDialog = new BusyDialog({
                text: bundle.getText("loading")
              });

              //abrindo o diálogo de carregamento
              t._oBusyDialog.open();

              //definindo um tempo de duração do diálogo de carregamento que será iniciado ao realizar a inserção
              setTimeout(
                // 1 Parâmetro do setTimeout
                function () {

                  //Realizar a chamada oData do serviço SAP
                  let oModelSend = new ODataModel(oDataServiceUrl, true);

                  //Criar produto a partir do objeto
                  oModelSend.remove(
                    sPath,
                    {
                      success: function (request, response) {
                        if (response.statusCode === 204) { //Deletado com sucesso
                          
                          //fechar o BusyDialog
                          t._oBusyDialog.close();

                          //setando o parâmetro de DELETE
                          t._bDelete = true;
debugger
                          //Menssage de sucesso
                          MessageBox["information"](bundle.getText("deleteDialogSuccess", [oProductSAP.Productid]), {
                            actions: [MessageBox.Action.OK],
                            onClose: function(oAction){
                              if(oAction === MessageBox.Action.OK){
                                t.getView().getModel().refresh();
                                oRouter.navTo("RouteLista");
                              }                            
                            }.bind(this)
                          });
                        }
                      },// FIM Função de retorno de SUCESSO

                      //Função de retorno de ERRO
                      error: function (e) {
                        //fechar o BusyDialog
                        t._oBusyDialog.close();

                        //Convertendo o erro para formato JSON
                        let oReturn = JSON.parse(e.response.body);
                        let errorJSONMsg = oReturn.error.message.value;

                        //Gerando mensagem TOAST para o erro
                        MessageToast.show(
                          errorJSONMsg, {
                          duration: 4000 //Toast Menssage dura 4s
                        }
                        );
                      },// FIM Função de retorno de ERRO

                    }
                  ); //Fim da função delete
                }, 2000 //2s - Duração da página de carregamento
              ); // FIM setTimeout
            } //FIM IF STATUS OK
            //FIM função do diálogo
          }, bundle.getText("deleteDialogTitle"),// Título do diálogo 
        );//FIM MessageBox
      }, //FIM função onDelete



    }); //end functions
  },
);
