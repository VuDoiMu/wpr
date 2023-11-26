import { db } from "../../app.js";
import { QUERY_RESULT } from "../../utils/enums.js";
import { getUserByIDNoPassword, getUsersByListIDs } from "../User/User.js";

export const getEmailByID = async (id) => {
    let sql = "SELECT * FROM emails WHERE id = ?"
    const [rows] = await db.promise().query(sql, [id])


    if (rows[0]) {
        const senderData = await getUserByIDNoPassword(rows[0].sender_id)
        const receiverData = await getUserByIDNoPassword(rows[0].receiver_id)
        return {
            status: QUERY_RESULT.FOUND_ONE,
            data: {
                id: rows[0].id,
                sender: senderData.data,
                receiver: receiverData.data,
                subject: rows[0].subject,
                message: rows[0].message,
                sendDate: rows[0].created_at,
                attachment: rows[0].attachment
            }
        }
    } else {
        return {
            status: QUERY_RESULT.NOT_FOUND,
            data: "No Email with such ID!"
        }
    }

}
export const getInboxByUserId = async (userId) => {
    let sql = "SELECT * FROM emails WHERE receiver_id = ?"
    const [rows] = await db.promise().query(sql, [userId])

    const inboxEmails = rows
    const allSenderIds = inboxEmails.map((email) => {
        return email.sender_id
    })

    const uniqueSenderID = [...new Set(allSenderIds)]

    const uniqueSenders = await getUsersByListIDs(uniqueSenderID)

    const inboxData = inboxEmails.map((email) => {

        return {
            id: email.id,
            sender: uniqueSenders.data.find((sender) => sender.id === email.sender_id),
            subject: email.subject,
            message: email.message,
            createdDate: email.created_at,
        }
    })

    return inboxData
}

export const getOutboxByUserId = async (userId) => {
    let sql = "SELECT * FROM emails WHERE sender_id = ?"
    const [rows] = await db.promise().query(sql, [userId])

    const Emails = rows
    const allReceiverIds = Emails.map((email) => {
        return email.receiver_id
    })

    const uniqueReceiverIDs = [...new Set(allReceiverIds)]

    const uniqueReceivers = await getUsersByListIDs(uniqueReceiverIDs)

    const emailData = Emails.map((email) => {

        return {
            id: email.id,
            receiver: uniqueReceivers.data.find((receiver) => receiver.id === email.receiver_id),
            subject: email.subject,
            message: email.message,
            createdDate: email.created_at,
        }
    })

    return emailData
}

export const composeEmail = async (senderID, receiverID, subject, body, attachment) => {
    const sql = `INSERT INTO emails (sender_id, receiver_id, subject, message, attachment) VALUES (?, ?, ?, ?, ?)`
    const [rows] = await db.promise().query(sql, [senderID, receiverID, subject, body, attachment]);

    if (rows) {
        return ({
            status: QUERY_RESULT.SUCCESS,
            data: "Email sent!"
        })
    } else {
        return ({
            status: QUERY_RESULT.FAIL,
            data: "Unable to sent email!"
        })
    }
}
