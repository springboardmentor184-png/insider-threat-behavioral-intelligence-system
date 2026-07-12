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

    def preprocess(self, path):

        dataframe = self.load_dataset(path)

        dataframe = self.remove_null_values(dataframe)

        dataframe = self.remove_duplicates(dataframe)

        return dataframe