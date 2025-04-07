from typing import Generic, TypeVar

T = TypeVar("T")

class Response(Generic[T]):

    def __init__(self, value: T = None, error: bool = False, message: str = "") -> None:
        super().__init__()

        self.value: T = value
        self.error: bool = error
        self.message: str = message

    
    def toDict(self) -> dict:
        return {
            "value": self.value,
            "error": self.error,
            "message": self.message
        }
