import { db } from "../../app.js";
import { LOGIN_RESULT, QUERY_RESULT, REGISTER_RESULT } from "../../utils/enums.js";

export const getAllUsers = async () => {
    const [rows] = await db.promise().query('SELECT * FROM users')
    return (rows.length === 0) ?
        {
            status: QUERY_RESULT.NOT_FOUND,
            data: "No user in Database"
        } : {
            status: QUERY_RESULT.FOUND_MANY,
            data: rows
        }
}

export const getUserById = async (userId) => {
    let sql = "SELECT * FROM users WHERE id = ?"
    const [rows] = await db.promise().query(sql, [userId])

    return rows[0] ? {
        status: QUERY_RESULT.FOUND_ONE,
        data: rows[0]
    } : {
        status: QUERY_RESULT.NOT_FOUND,
        data: `User with id ${userId} not found!`
    }
}
export const handleLogin = async (email, password) => {
    let sql = "SELECT * FROM users WHERE email = ?"
    const [rows] = await db.promise().query(sql, [email])
    if (!rows[0]) {
        return {
            status: LOGIN_RESULT.EMAIL_NOT_FOUND,
            data: `User with Email ${email} not found!`
        }
    }

    return (rows[0].password === password) ? {
        status: LOGIN_RESULT.SUCCESS,
        data: rows[0]
    } : {
        status: LOGIN_RESULT.PASSWORD_WRONG,
        data: 'Password incorrect!'
    }

}

export const handleRegister = async (userName, email, password) => {
    console.log(userName, email, password)
    let searchSql = "SELECT * FROM users WHERE email = ?"
    const [rows] = await db.promise().query(searchSql, [email])
    if (rows[0]) {
        return {
            status: REGISTER_RESULT.EMAIL_EXIST,
            data: 'Email already used!'
        }
    }

    let insertSql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
    const [_rows] = await db.promise().query(insertSql, [userName, email, password])

    return {
        status: REGISTER_RESULT.SUCCESS,
        data: "User Registered"
    }
}

export const getUserByIDNoPassword = async (userID) => {
    const sql = `SELECT * FROM users WHERE id = ?`
    const [rows] = await db.promise().query(sql, userID);

    return rows[0] ? {
        status: QUERY_RESULT.FOUND_ONE,
        data: {
            id: rows[0].id,
            name: rows[0].name,
            email: rows[0].email
        }
    } : {
        status: QUERY_RESULT.NOT_FOUND,
        data: `User with id ${userId} not found!`
    }
}

export const getUserByEmailNoPassword = async (email) => {
    const sql = `SELECT * FROM users WHERE email = ?`
    const [rows] = await db.promise().query(sql, email);

    return rows[0] ? {
        status: QUERY_RESULT.FOUND_ONE,
        data: {
            id: rows[0].id,
            name: rows[0].name,
            email: rows[0].email
        }
    } : {
        status: QUERY_RESULT.NOT_FOUND,
        data: `User with id ${userId} not found!`
    }
}
export const getAllUsersNoPassword = async (currentID) => {
    const [rows] = await db.promise().query('SELECT * FROM users WHERE id != ?', currentID)

    const result = rows.map((item) => {
        return {
            id: item.id,
            name: item.name,
            email: item.email
        }
    })
    if (rows[0]) {
        return {
            status: QUERY_RESULT.SUCCESS,
            data: result
        };
    } else {
        return {
            status: QUERY_RESULT.NOT_FOUND,
            data: "No user found"
        };
    }
}
export const getUsersByListIDs = async (ids) => {
    const sql = `SELECT * FROM users WHERE id IN (${ids})`;
    const [rows] = await db.promise().query(sql);

    const result = rows.map((item) => {
        return {
            id: item.id,
            name: item.name,
            email: item.email
        }
    })
    if (rows[0]) {
        return {
            status: QUERY_RESULT.SUCCESS,
            data: result
        };
    } else {
        return {
            status: QUERY_RESULT.NOT_FOUND,
            data: "No user found"
        };
    }
};
