from rest_framework import serializers
from .models import *
from rest_framework.fields import CurrentUserDefault


class PostSerializer(serializers.ModelSerializer):
    poster = serializers.SerializerMethodField()
    current_user = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = '__all__'

    def get_poster(self, obj):
        return obj.username #bcause of property
    
    def get_current_user(self, obj):
        user = None
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user.username
            print(request.user.username)
        return user

    def get_likes(self, obj):
        return Like.objects.filter(liked=obj.id, liking=True).count()


class FollowSerializer(serializers.ModelSerializer):
    follower_user = serializers.SerializerMethodField()
    followed_user = serializers.SerializerMethodField()

    class Meta:
        model = Follow
        fields =['id', 'follower_user', 'followed_user', 'following']

    def get_follower_user(self, obj):
        return obj.follower.username

    def get_followed_user(self, obj):
        return obj.followed.username


class LikeSerializer(serializers.ModelSerializer):
    liker_user = serializers.SerializerMethodField()
    liked_content = serializers.SerializerMethodField()

    class Meta:
        model = Like
        fields =['id', 'liker_user', 'liked', 'liked_content', "liking"]

    def get_liker_user(self, obj):
        return obj.liker.username

    def get_liked_content(self, obj):
        return obj.liked.content

