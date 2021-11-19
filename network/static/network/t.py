from django.http import HttpResponse
from django.shortcuts import render
from django.http import JsonResponse
from django.http import Http404
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import *
from django.utils import timezone
from .models import *
from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from collections import OrderedDict
from rest_framework.pagination import PageNumberPagination
from rest_framework.generics import ListAPIView

# Create your views here.

@api_view(['GET'])
def apiOverview(request):
    api_urls = {
        'List':'/post-list/',
        'Detail View':'/post-detail/<str:pk>/',
        'Create':'/post-create/',
        'Update':'/post-update/<int:pk>/',
        'Delete':'/post-delete/<int:pk>/',
        }

    return Response(api_urls)



@api_view(['GET'])
def postList(request, sort):
    if sort == "all":
        posts = Post.objects.all()
        for post in posts:
            username = User.objects.get(username=post.author)
            post.author = username
            #print(post.author)
    elif sort == "followed":
        user = request.user
        followed = Follow.objects.filter(follower=user, following=True)
        users = []
        for f in followed:
            users.append(f.followed)
        print(users)
        posts = Post.objects.filter(author__in=users)
        print(posts)
    else:
        try:
            user = User.objects.get(username=sort)
            posts = Post.objects.filter(author=user)
        except User.DoesNotExist:
            #return JsonResponse({"error": "User doesn't exist."}, status=400)
            return Response(status=status.HTTP_400_BAD_REQUEST)
    
    #print(f"POSTS: {posts}")
    posts = posts.order_by('-date_posted')
    #serializer = PostSerializer(posts, many=True)

    paginator = PageNumberPagination()
    paginator.page_size = 10

    result_page = paginator.paginate_posts(posts, request)

    serializer = PostSerializer(posts_paginated, many=True)
    return paginator.get_paginated_response(serializer.data)
    
    #return Response(serializer.data)


@api_view(['GET'])
def postDetail(request, pk):
    post = Post.objects.get(id=pk) #when post doesnt exist?
    serializer = PostSerializer(post, many=False)
    return Response(serializer.data)


@api_view(['GET'])
def lastPost(request, username):
    user = User.objects.get(username=username)
    last_post = Post.objects.filter(author=user).order_by("-date_posted").first()
    serializer = PostSerializer(last_post, many=False)
    return Response(serializer.data)


class PostCreate(APIView):

    def post(self, request, format=None): #check if user logged in
        #serializer = PostSerializer(data= request.data, context={'request': request})
        data = request.data
        data["author"] = request.user.pk #check if user is logged in
        serializer = PostSerializer(data=data, context={'request': request})#add author=r.u.p?
        #data["author"] = request.user
        #serializer.data = data

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def postUpdate(request, pk):
    post = Post.objects.get(id=pk)
    serializer = PostSerializer(instance=post, data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)


@api_view(['DELETE'])
def postDelete(request, pk):
    post = Post.objects.get(id=pk)
    post.delete()

    return Response('Item successfully deleted!')


@api_view(['GET', 'PUT'])
def followState(request, follower, followed):

    try:
        u1 = User.objects.get(username=follower)
        u2 = User.objects.get(username=followed)
    except User.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    if follower == followed:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    

    if request.method == 'GET':
        try:
            f = Follow.objects.get(follower=u1, followed=u2)
            serializer = FollowSerializer(f, many=False)
            return Response(serializer.data)
        except Follow.DoesNotExist:
            f = {
                "id": None,
                "follower_user": follower,
                "followed_user": followed, 
                "following": False
            }
            serializer = FollowSerializer(f, many=False)
            #serializer = FollowSerializer(follower=follower, followed=followed, following=False)
            #return Response(status=status.HTTP_400_BAD_REQUEST)
            #print(serializer.data)
            return Response(f)

    elif request.method == 'PUT':
        try:
            f = Follow.objects.get(follower=u1, followed=u2)
            print(f.following)
            f.following = not(f.following)
            print(f.following)
            f.save()
            return Response(status=status.HTTP_200_OK)
        except Follow.DoesNotExist:
            Follow.objects.create(follower=u1, followed=u2, following=True)
            return Response(status=status.HTTP_201_CREATED)
