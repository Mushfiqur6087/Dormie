package com.HMS.hms.Payment;

import java.util.Map;

import org.springframework.stereotype.Component;

/**
 * This class handles the Response parameters redirected from payment success page.
 * Validates those parameters fetched from payment page response and returns true for successful transaction
 * and false otherwise.
 */
@Component
public class TransactionResponseValidator {
    /**
     *
     * @param request
     * @return
     * @throws Exception
     * Send Received params from your success resoponse (POST ) in this Map</>
     */
    public boolean receiveSuccessResponse(Map<String, String> request) throws Exception {

        String trxId = request.get("tran_id");
        /**
         * Get the actual AMOUNT and Currency from the callback response instead of hardcoded values
         */
        String amount = request.get("amount");
        String currency = request.get("currency");
        
        // Validate that we have the required parameters
        if (trxId == null || amount == null || currency == null) {
            return false;
        }
        
        // Set your store Id and store password and define TestMode
        SSLCommerz sslcz = new SSLCommerz("abc682f4e02dae8b", "abc682f4e02dae8b@ssl", true);

        /**
         * If following order validation returns true, then process transaction as success.
         * if this following validation returns false , then query status if failed of canceled.
         *      Check request.get("status") for this purpose
         */
        return sslcz.orderValidate(trxId, amount, currency, request);

    }
}
