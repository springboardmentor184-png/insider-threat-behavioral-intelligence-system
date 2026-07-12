from datetime import datetime


def current_time():

    return datetime.now()


def success_response(
    message,
    data=None
):

    return {
        "status": "success",
        "message": message,
        "data": data
    }


def error_response(message):
    return {
        "status": "error",
        "message": message
    }