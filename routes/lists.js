const express = require("express");
const router = express.Router();
const { sendSuccess, sendError } = require("../helpers/response");
const RESPONSE = require("../helpers/constants");

const db = require("../database");

/*
|--------------------------------------------------------------------------
| CREATE LIST
|--------------------------------------------------------------------------
*/

router.post("/create-list", (req, res) => {

    const { phone, list_name } = req.body;

    if (!phone || !list_name) {
      return sendError(
    res,
    "Phone and list name are required"
); 
    }

    db.run(
        "INSERT INTO lists (user_phone, list_name) VALUES (?, ?)",
        [phone, list_name],
        function (err) {

            if (err) {
            return sendError(
    res,
    RESPONSE.DATABASE_ERROR
);
            }

         return sendSuccess(
    res,
    RESPONSE.LIST_CREATED,
    {
        list_id: this.lastID,
        list_name
    }
);  

        }
    );

});

/*
|--------------------------------------------------------------------------
| ADD RECIPIENT
|--------------------------------------------------------------------------
*/

router.post("/add-recipient", (req, res) => {

    const {
        list_id,
        recipient_name,
        destination_identifier,
        amount
    } = req.body;

    if (!list_id) {
    return sendError(res, "List ID is required");    
    }

    if (!recipient_name || recipient_name.trim().length < 2) {
      return sendError(res, "Recipient name is too short");  
    }

    if (!destination_identifier || destination_identifier.trim() === "") {
    return sendError(res, "Destination identifier is required");    
    }

    if (!amount || amount <= 0) {
     return sendError(res, "Amount must be greater than zero");   
    }

    db.get(
        `SELECT id
         FROM list_items
         WHERE list_id = ?
         AND destination_identifier = ?`,
        [list_id, destination_identifier],
        (err, existing) => {

            if (err) {
               return sendError(res, RESPONSE.DATABASE_ERROR); 
            }

            if (existing) {
             return sendError(
    res,
    "This destination identifier already exists in the list"
);   
            }

            db.run(
                `INSERT INTO list_items
                (list_id, recipient_name, destination_identifier, amount)
                VALUES (?, ?, ?, ?)`,
                [
                    list_id,
                    recipient_name,
                    destination_identifier,
                    amount
                ],
                function (err) {

                    if (err) {
                     return sendError(res, RESPONSE.DATABASE_ERROR);   
                    }

                return sendSuccess(
    res,
    RESPONSE.RECIPIENT_CREATED,
    {
        recipient_id: this.lastID
    }
);   

                }
            );

        }
    );

});
/*
|--------------------------------------------------------------------------
| LIST ITEMS
|--------------------------------------------------------------------------
*/

router.get("/list-items", (req, res) => {

    const { list_id } = req.query;

   if (!list_id) {
    return sendError(res, "List ID is required");
}

    db.all(
        `SELECT *
         FROM list_items
         WHERE list_id = ?`,
        [list_id],
        (err, rows) => {

           if (err) {
    return sendError(res, RESPONSE.DATABASE_ERROR);
}

     return sendSuccess(
    res,
    RESPONSE.LIST_ITEMS_FOUND,
    rows
);

        }
    );

});
/*
|--------------------------------------------------------------------------
| RENAME LIST
|--------------------------------------------------------------------------
*/

router.put("/rename-list", (req, res) => {

    const { list_id, list_name } = req.body;

  if (!list_id) {
    return sendError(res, "List ID is required");
}  
   if (!list_name || list_name.trim().length < 2) {
    return sendError(res, "List name is too short");
} 

    db.run(
        "UPDATE lists SET list_name = ? WHERE id = ?",
        [list_name, list_id],
        function(err){

          if (err) {
    return sendError(res, RESPONSE.DATABASE_ERROR);
} 

      if (this.changes === 0) {
    return sendError(res, RESPONSE.LIST_NOT_FOUND);
}      

        return sendSuccess(
    res,
    RESPONSE.LIST_RENAMED
);    

        }
    );

});
router.delete("/delete-list", (req, res) => {

    const { list_id } = req.body;

    if (!list_id) {
    return sendError(res, "List ID is required");
}

    db.run(
        "DELETE FROM list_items WHERE list_id = ?",
        [list_id],
        function (err) {

            
         if (err) {
    return sendError(res, RESPONSE.DATABASE_ERROR);
}   

            db.run(
                "DELETE FROM lists WHERE id = ?",
                [list_id],
                function (err) {

                    if (err) {
    return sendError(res, RESPONSE.DATABASE_ERROR);
}

       if (this.changes === 0) {
    return sendError(res, RESPONSE.LIST_NOT_FOUND);
}             
      return sendSuccess(
    res,
    RESPONSE.LIST_DELETED
);              
                }
            );

        }
    );

});
router.put("/edit-recipient", (req, res) => {

    const {
        recipient_id,
        recipient_name,
        destination_identifier,
        amount
    } = req.body;

    if (
        !recipient_id ||
        !recipient_name ||
        !destination_identifier ||
        !amount
    ) {
       return sendError(
    res,
    "Missing required fields"
);
    }

    db.run(
        `
        UPDATE list_items
        SET
            recipient_name = ?,
            destination_identifier = ?,
            amount = ?
        WHERE id = ?
        `,
        [
            recipient_name,
            destination_identifier || "",
            amount,
            recipient_id
        ],
        function (err) {

            if (err) {
             return sendError(
    res,
    RESPONSE.DATABASE_ERROR
);  
            }

            if (this.changes === 0) {
             return sendError(
    res,
    RESPONSE.RECIPIENT_NOT_FOUND
);   
            }

         return sendSuccess(
    res,
    RESPONSE.RECIPIENT_UPDATED
);   

        }
    );

});
router.get("/my-lists", (req, res) => {

    const { phone } = req.query;

    if (!phone) {
        return sendError(res, "Phone is required");
    }

    db.all(
        `
        SELECT
            id,
            list_name,
            created_at
        FROM lists
        WHERE user_phone = ?
        ORDER BY created_at DESC
        `,
        [phone],
        (err, rows) => {

            if (err) {
                return sendError(res, RESPONSE.DATABASE_ERROR);
            }

            return sendSuccess(
                res,
                RESPONSE.LISTS_FOUND,
                rows
            );

        }
    );

});
module.exports = router;