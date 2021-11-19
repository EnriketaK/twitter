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
from rest_framework import pagination
from rest_framework.generics import ListAPIView
from rest_framework.exceptions import APIException


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

class CustomPagination(pagination.PageNumberPagination):
    page_size = 10

    def get_paginated_response(self, data):
        print(data)
        return Response({
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'current_page': int(self.request.query_params.get('page', 1)),
            'total': self.page.paginator.count,
            'per_page': self.page_size,
            'total_pages': round(self.page.paginator.count/self.page_size, 1),
            'data': data,
        })


class PostList(ListAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    pagination_class = CustomPagination



class PostListUser(ListAPIView):
    serializer_class = PostSerializer
    pagination_class = CustomPagination
    

    def get_queryset(self):
        try:
            user = User.objects.get(username=self.kwargs["username"])
            queryset = Post.objects.filter(author=user.pk)
            return queryset
        except User.DoesNotExist:
            raise UsernameError()


class PostListFollowing(ListAPIView):
    serializer_class = PostSerializer
    pagination_class = CustomPagination
    
    def get_queryset(self):
        user = self.request.user
        followed = Follow.objects.filter(follower=user, following=True)
        users = []
        for f in followed:
            users.append(f.followed)
        print(users)
        queryset = Post.objects.filter(author__in=users)
        return queryset
        print(posts)
    

class UsernameError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = u'User doesnt exist.'


@api_view(['GET'])
def postDetail(request, pk):
    post = Post.objects.get(id=pk) #when post doesnt exist?
    serializer = PostSerializer(post, many=False)
    print(serializer.data)
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
            print(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def postUpdate(request, pk):
    post = Post.objects.get(id=pk)
    serializer = PostSerializer(instance=post, data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)


class PostUpdate(generics.RetrieveUpdateAPIView):
    #queryset = Post.objects.all() works too
    serializer_class = PostSerializer #mos duhet e nje serilaizer tjt?
    lookup_field = 'pk'
    
    def get_object(self):
        queryset = Post.objects.get(pk=self.kwargs["pk"]) 
        return queryset

    def put(self, request, *args, **kwargs):
        print(kwargs)
        return self.update(request, *args, **kwargs)



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


@api_view(['GET', 'PUT'])
def likeState(request, liker, liked):

    try:
        user = User.objects.get(username=liker)
        post = Post.objects.get(id=liked)
    except User.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except Post.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'GET':
        try:
            l = Like.objects.get(liker=user, liked=post)
            serializer = LikeSerializer(l, many=False)
            return Response(serializer.data)
        except Like.DoesNotExist:
            l = {
                "id": None,
                "liker_user": liker,
                "liked": liked,
                "liked_content": post.content, 
                "liking": False
            }
            print(l)
            serializer = LikeSerializer(l, many=False)
            return Response(l)

    elif request.method == 'PUT':
        try:
            l = Like.objects.get(liker=user, liked=post)
            l.liking = not(l.liking)
            l.save()
            return Response(status=status.HTTP_200_OK)
        except Like.DoesNotExist:
            Like.objects.create(liker=user, liked=post, liking=True)
            return Response(status=status.HTTP_201_CREATED)