class RiskScore:

    def calculate(
        self,
        failed_login,
        usb_activity,
        unusual_login,
        file_download
    ):

        score = 0

        score += failed_login * 10

        score += usb_activity * 20

        score += unusual_login * 30

        score += file_download * 15

        if score > 100:
            score = 100
        return score