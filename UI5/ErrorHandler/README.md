## ErrorHandler

this will show SAP sent error messages or any error in odata calls automatically

## Setup

paste the ErrorHandler.js file in controller folder and update component.js file as below

- add ErrorHandler dependency in sap.ui.define like below

```javascript
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"yournamespace/model/models",
	"yournamespace/controller/ErrorHandler"
], function (UIComponent, Device, models, ErrorHandler) {
	"use strict";
```

- initialize error handler in 'init' method

```javascript
//initialize the error handler with the component
this._oErrorHandler = new ErrorHandler(this);
```

- add a destroy method if not already available

```javascript
/**
* The component is destroyed by UI5 automatically.
* In this method, the ErrorHandler is destroyed.
* @public
* @override
*/
destroy: function () {
	this._oErrorHandler.destroy();
	// call the base component's destroy function
	UIComponent.prototype.destroy.apply(this, arguments);
},
```
- FAQ: make sure that if you have your own success and error handler functions, those are executed without any exception so that flow can reach this error handler file
