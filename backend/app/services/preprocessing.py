import pandas as pd

class DataPreprocessing:

    def load_dataset(self, path):
        return pd.read_csv(path)

    def remove_null_values(self, dataframe):
        dataframe = dataframe.dropna()
        return dataframe

    def remove_duplicates(self, dataframe):
        dataframe = dataframe.drop_duplicates()
        return dataframe

    def build_employee_features(self, dataframe):
        dataframe['timestamp'] = pd.to_datetime(dataframe['timestamp'])
        dataframe['login_hour'] = dataframe['timestamp'].dt.hour
        dataframe['is_after_hours'] = dataframe['login_hour'].apply(
            lambda h: 1 if h < 6 or h > 20 else 0
        )

        features = dataframe.groupby('employee_id').agg(
            avg_login_hour=('login_hour', 'mean'),
            after_hours_ratio=('is_after_hours', 'mean'),
            file_downloads=('action', lambda x: (x == 'download').sum()),
            file_uploads=('action', lambda x: (x == 'upload').sum()),
            usb_events=('action', lambda x: (x == 'usb_connect').sum()),
            failed_logins=('action', lambda x: (x == 'login_failed').sum()),
            unique_devices=('device_id', 'nunique'),
        ).reset_index()

        return features

    def preprocess(self, path):
        dataframe = self.load_dataset(path)
        dataframe = self.remove_null_values(dataframe)
        dataframe = self.remove_duplicates(dataframe)
        return dataframe

    def preprocess_and_featurize(self, path):
        dataframe = self.preprocess(path)
        features = self.build_employee_features(dataframe)
        return features
