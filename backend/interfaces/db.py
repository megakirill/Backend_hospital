from abc import ABC, abstractmethod


class DB(ABC):

    def __init__(self, url: str):
        self._url = url

    @abstractmethod
    async def connect(self):
        pass

    @abstractmethod
    async def close(self):
        pass
