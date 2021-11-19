from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.urls import reverse

class User(AbstractUser):
    pass

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE) ##
    content = models.TextField(max_length=400, blank=False)
    date_posted = models.DateTimeField(auto_now_add=True)

    @property
    def username(self):
        return self.author.username

    def __int__(self):
        return self.id
    
    class Meta:
        ordering = ['-date_posted']


class Like(models.Model):
    liker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='liker')
    liked = models.ForeignKey(Post, on_delete=models.CASCADE)
    liking = models.BooleanField(default=False, blank=True, null=True)


class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, default='None', related_name='follower') 
    followed = models.ForeignKey(User, on_delete=models.CASCADE, default='None', related_name='followed')
    following = models.BooleanField(default=False, blank=True, null=True)
