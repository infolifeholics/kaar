/**
 * Google Apps Script (Code.gs)
 * Paste this script into your Google Sheet (Extensions > Apps Script)
 * to receive real-time Cart and Orders updates from the website directly.
 * 
 * Spreadsheet URL:
 * https://docs.google.com/spreadsheets/d/1couKMsGuunmNDY89HJfCXgRljxytHOqMgqDF0rGYh8k/edit
 */

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = contents.action;
    
    // 1. CART UPDATES
    if (action === 'cart_update') {
      var cartSheet = ss.getSheetByName('Cart');
      if (!cartSheet) {
        cartSheet = ss.insertSheet('Cart');
        cartSheet.appendRow([
          'User ID', 'Customer Name', 'Email', 'Product ID', 'Product Name',
          'Quantity', 'Unit Price', 'Currency', 'Cart Total', 'Added At',
          'Updated At', 'Location'
        ]);
      }
      
      var items = contents.data; // Array of cart items
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        
        // Find if row for (User ID + Product ID) already exists
        var data = cartSheet.getDataRange().getValues();
        var foundRow = -1;
        for (var r = 1; r < data.length; r++) {
          if (data[r][0] == item.userId && data[r][3] == item.productId) {
            foundRow = r + 1;
            break;
          }
        }
        
        if (foundRow > 0) {
          // Update Quantity, Cart Total, Updated At
          cartSheet.getRange(foundRow, 6).setValue(item.quantity);
          cartSheet.getRange(foundRow, 9).setValue(item.cartTotal);
          cartSheet.getRange(foundRow, 11).setValue(item.updatedAt);
        } else {
          // Append new row
          cartSheet.appendRow([
            item.userId,
            item.customerName,
            item.email,
            item.productId,
            item.productName,
            item.quantity,
            item.unitPrice,
            item.currency,
            item.cartTotal,
            item.addedAt,
            item.updatedAt,
            item.location
          ]);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Cart synced' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. ORDER UPDATES
    if (action === 'order_create' || action === 'order_update') {
      var ordersSheet = ss.getSheetByName('Orders');
      if (!ordersSheet) {
        ordersSheet = ss.insertSheet('Orders');
        ordersSheet.appendRow([
          'Order ID', 'User ID', 'Customer Name', 'Email', 'Phone',
          'Product IDs', 'Product Names', 'Quantities', 'Subtotal', 'Shipping',
          'Total', 'Currency', 'Payment Status', 'Order Status', 'Razorpay Order ID',
          'Razorpay Payment ID', 'Order Date', 'Address'
        ]);
      }
      
      var o = contents.data;
      ordersSheet.appendRow([
        o.orderId,
        o.userId,
        o.customerName,
        o.email,
        o.phone,
        o.productIds,
        o.productNames,
        o.quantities,
        o.subtotal,
        o.shipping,
        o.total,
        o.currency,
        o.paymentStatus,
        o.orderStatus,
        o.razorpayOrderId,
        o.razorpayPaymentId,
        o.orderDate,
        o.address
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Order appended' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
