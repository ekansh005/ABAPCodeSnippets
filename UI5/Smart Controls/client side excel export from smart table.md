By default smart table export to excel calls OData service with pagination to load the data from server and then creates the excel from this data. It is perfectly okay for small data set or where pagination is properly handled on the OData service layer (implemented at query level). However, when the OData service takes long time to respond the data, paginating a large set of records multiplies the total time taken to fetch the whole dataset.

In this case, you can disable the pagination in your smart table to load the whole data at once on the client side and then export the already available data to excel quickly.

It is important to note that whole data set should be already available on the client side.

Add this to your smart table code:

```
beforeExport="onBeforeExport"
```

Update your table threshold to a large number:

```
 <Table growingThreshold="99999" growing="true" growingScrollToLoad="true" alternateRowColors="true">
```

Then in your controller, copy the dataset to a local variable for easy access:

```js
      onBeforeRebindTable: function (evt) {
        var mBindingParams = evt.getParameter("bindingParams");
        var aFilters = this.applyFilters();
        aFilters.forEach(function (oFilter) {
          mBindingParams.filters.push(oFilter);
        });
        mBindingParams.events = {
          dataRequested: this.onDataRequested.bind(this),
          dataReceived: this.onDataReceived.bind(this),
        };
      },

      onDataReceived: function (oEvent) {
        this.getView().getModel("appView").setProperty("/busy", false);
        this.aSmartTableData = oEvent.getParameter("data").results;
      },
```

Then provide the local data source at the time of export.

```js
      onBeforeExport: function (oEvent) {
        // since the data in smart table could be huge and alredy loaded on the client side,
        // we need to utilize the same data instead of fetching it again (default behavior)
        oEvent.getParameter("exportSettings").dataSource = this.aSmartTableData;
      },
```
