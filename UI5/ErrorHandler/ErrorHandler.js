sap.ui.define(["sap/ui/base/Object", "sap/m/MessageBox"], function (UI5Object, MessageBox) {
  "use strict";

  return UI5Object.extend("com.wartsila.mobile.cman.projects.controller.ErrorHandler", {
    /* =========================================================== */
    /* lifecycle methods                                           */
    /* =========================================================== */

    /**
     * From here we manage to return all message from Backend
     * @param {object} oComponent the OwnerComponent from Component.js
     */
    constructor: function (oComponent) {
      this._oComponent = oComponent;
      this._oModel = oComponent.getModel();
      this._bMessageOpen = false;

      var oParams;
      /*-------------------------------------------------------------------------*/

      this._oModel.attachMetadataFailed(function (oEvent) {
        oParams = oEvent.getParameters();
        this._showServiceError(oParams.response, oComponent);
      }, this);
      this._oModel.attachRequestFailed(function (oEvent) {
        oParams = oEvent.getParameters();
        if (
          oParams.response.statusCode !== "404" ||
          (oParams.response.statusCode === 404 && oParams.response.responseText.indexOf("Cannot POST") === 0)
        ) {
          this._showServiceError(oParams.response, oComponent);
        }
      }, this);
    },

    /* =========================================================== */
    /* begin: internal methods                                     */
    /* =========================================================== */
    /**
     * Returns the error messages from Backend
     * @constructor
     * @param {object} oDetails the
     */
    _showServiceError: function (oDetails) {
      var oError, oParser, oXmlDoc, sJSONText, sMessage, sHtml, sHtmlJSONText;

      /*-------------------------------------------------------------------------*/

      if (this._bMessageOpen) {
        return;
      }
      this._bMessageOpen = true;
      if (oDetails.responseText !== undefined) {
        try {
          oError = JSON.parse(oDetails.responseText);
        } catch (err) {
          try {
            oParser = new DOMParser();
            oXmlDoc = oParser.parseFromString(oDetails.responseText, "text/xml");
            sJSONText = JSON.stringify(this._XMLToJSON(oXmlDoc));
            oError = JSON.parse(sJSONText);
          } catch (errDomParser) {
            try {
              sHtmlJSONText = this._mapDOM(oDetails.responseText, true);
              sHtml = JSON.parse(sHtmlJSONText);
              sMessage = Array.isArray(sHtml.content[1].content[0])
                ? sHtml.content[1].content[0].content[0]
                : sHtml.content[1].content[0];
            } catch (errHTMLParse) {
              sMessage = "";
            }
          }
        }
        if (oError && oError.error) {
          if (oError.error.message.value) {
            sMessage = oError.error.message.value;
          } else {
            sMessage = oError.error.message["#text"];
          }
        } else if (oError && oError.html) {
          sMessage = oError.html.body.h1["#text"];
        } else if (!sMessage) {
          sMessage = "";
        }
      }
      if (sMessage) {
        MessageBox.error(sMessage, {
          styleClass: this._oComponent.getContentDensityClass(),
          actions: [MessageBox.Action.CLOSE],
          onClose: function () {
            this._bMessageOpen = false;
          }.bind(this),
        });
      } else {
        sMessage = this._oComponent.getModel("i18n").getResourceBundle().getText("Error.UnknownError");
      }
    },
    /**
     * Convert JSON to XML.
     * @constructor
     * @param {object} oXML XML file.
     * @returns {string} JSON string.
     */
    _XMLToJSON: function (oXML) {
      var oObj = {},
        oAttribute,
        oOld;

      if (oXML.nodeType === 1) {
        if (oXML.attributes.length > 0) {
          oObj["@attributes"] = {};
          oXML.attributes.forEach(function (sValues, vIndex) {
            oAttribute = oXML.attributes.item(vIndex);
            oObj["@attributes"][oAttribute.nodeName] = oAttribute.nodeValue;
          });
        }
      } else if (oXML.nodeType === 3) {
        oObj = oXML.nodeValue;
      }
      if (oXML.hasChildNodes()) {
        oXML.childNodes.forEach(function (sValues, vIndex) {
          var item = oXML.childNodes.item(vIndex);
          var nodeName = item.nodeName;
          if (typeof oObj[nodeName] === undefined) {
            oObj[nodeName] = this._XMLToJSON(item);
          } else {
            if (typeof oObj[nodeName].push === undefined) {
              oOld = oObj[nodeName];
              oObj[nodeName] = [];
              oObj[nodeName].push(oOld);
            }
            oObj[nodeName].push(this._XMLToJSON(item));
          }
        });
      }
      return oObj;
    },

    _mapDOM: function (oElements, json) {
      var oTreeObject = {},
        oParser,
        oDocNode,
        oElement = oElements;

      // If string convert to document Node
      if (typeof oElement === "string") {
        if (window.DOMParser) {
          oParser = new DOMParser();
          oDocNode = oParser.parseFromString(oElement, "text/xml");
        }
        oElement = oDocNode.firstChild;
      }
      //Recursively loop through DOM elements and assign properties to object
      function treeHTML(oElem, object) {
        object.type = oElem.nodeName;
        var nodeList = oElem.childNodes;
        if (nodeList) {
          if (nodeList.length) {
            object.content = [];
            for (var i = 0; i < nodeList.length; i++) {
              if (nodeList[i].nodeType === 3) {
                object.content.push(nodeList[i].nodeValue);
              } else {
                object.content.push({});
                treeHTML(nodeList[i], object.content[object.content.length - 1]);
              }
            }
          }
        }
        if (oElem.attributes) {
          if (oElem.attributes.length) {
            object.attributes = {};
            for (i = 0; i < oElem.attributes.length; i++) {
              object.attributes[oElem.attributes[i].nodeName] = oElem.attributes[i].nodeValue;
            }
          }
        }
      }
      treeHTML(oElement, oTreeObject);

      return json ? JSON.stringify(oTreeObject) : oTreeObject;
    },
  });
});
