# Export to Excel utility for sap.m.Table with JSON Model

- Add `sap/ui/export/Spreadsheet` dependency in your base controller
- Paste the below code snippet in your base controller file

```javascript
      exportToExcel: function (oEvent, { fileName = "Export" }) {
        const table = oEvent.getSource().getParent().getParent(); // button > toolbar > table
        const cols = table.getColumns().map((col) => col.getHeader().getText());
        const items = table.getItems();
        if (items.length > 0) {
          const item = items[0];
          const cells = item.getCells() || [];
          const cellsConfig = [];
          cells.forEach((cell) => {
            const controlType = cell.getMetadata().getName();
            const data = {
              type: "String",
              bindingInfos: [],
            };
            if (controlType === "sap.m.Text" || controlType === "sap.m.ObjectStatus") {
              data.type = cell.getBindingInfo("text").binding.getType()?.getName() || "String";
              data.bindingInfos.push(cell.getBindingInfo("text").parts[0]);
            } else if (controlType === "sap.m.ObjectIdentifier") {
              data.type = cell.getBindingInfo("text").binding.getType()?.getName() || "String";
              data.bindingInfos.push(cell.getBindingInfo("text").parts[0]);
              data.bindingInfos.push(cell.getBindingInfo("title").parts[0]);
            } else if (controlType === "sap.m.VBox") {
              cell.getItems().forEach((item) => {
                // TODO: support more controls or recursive function
                data.type = item.getBindingInfo("text").binding.getType()?.getName() || "String";
                data.bindingInfos.push(item.getBindingInfo("text").parts[0]);
              });
            } else if (controlType === "sap.m.Input") {
              data.type = cell.getBindingInfo("value").binding.getType()?.getName() || "String";
              data.bindingInfos.push(cell.getBindingInfo("value").parts[0]);
            }
            cellsConfig.push(data);
          });

          // create column config
          const aCols = [];
          cellsConfig.forEach((cellConfig, index) => {
            cellConfig.bindingInfos.forEach((bindingInfo, bindingIndex) => {
              const col = {
                label: cols[index].replace("Short", ""),
                property: bindingInfo.path.replace("/", "__"),
                sourceProperty: bindingInfo.path, // custom helper attribute
                type: cellConfig.type,
              };
              if (cellConfig.type === "Currency") {
                col.type = "Number";
                col.scale = 2;
                col.delimiter = true;
              }
              if (bindingIndex > 0) {
                col.label = this.capitalizeFirstWord(bindingInfo.path).replace("Short", "");
              }
              aCols.push(col);
            });
          });

          // data
          const itemsBinding = table.getBinding("items");
          // const data = itemsBinding.getModel().getProperty(itemsBinding.getPath());
          const ctxs = itemsBinding.getContexts();
          const data = ctxs.map((ctx) => {
            const item = {};
            aCols.forEach((col) => {
              const prop = col.sourceProperty.replace("Short", "");
              item[col.property] = ctx.getProperty(prop);
            });
            return item;
          });

          // export to excel
          const oSettings = {
            workbook: {
              columns: aCols,
            },
            dataSource: data,
            fileName,
            worker: false,
          };

          const oSheet = new Spreadsheet(oSettings);
          oSheet.build().finally(function () {
            oSheet.destroy();
          });
        }
      },
```

- Add a new button for export to excel in your `sap.m.Table` control's toolbar like below

```xml
<Button id="exportToExcelBtn" icon="sap-icon://excel-attachment" press="onExportTable" />
```

- Add `onExportTable` function in your view's controller file like below

```javascript
      onExportTable: function (oEvent) {
        this.exportToExcel(oEvent, {
          fileName: "Payment Req Form.xlsx",
        });
      },
```
