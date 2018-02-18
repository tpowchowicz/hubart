PROJECT_ROOT = $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
BUILD_MODE = debug
CXXFLAGS = -I/usr/local/include -std=c++11 -Wall


GENINC = -Igen-cpp
LDFLAGS = -lthrift -pthread

SRCS = src_cpp/worker.cpp \
	gen-cpp/Worker_constants.cpp \
	gen-cpp/Worker_types.cpp \
	gen-cpp/Worker.cpp

OBJS=$(subst .cpp,.o,$(SRCS))

ifeq ($(BUILD_MODE),debug)
	CFLAGS += -g
else ifeq ($(BUILD_MODE),run)
	CFLAGS += -O2
else
	$(error Build mode $(BUILD_MODE) not supported by this Makefile)
endif

all:	| gen_cpp gen_nodejs worker

worker:	$(OBJS)
	$(CXX) $(LIBDIR) -o $@ $^ $(LDFLAGS)

%.o:	%.cpp
	$(CXX) -c $(GENINC) $(CFLAGS) $(CXXFLAGS) -o $@ $<

clean:
	rm -fr logger $(OBJS)

gen_cpp:
	thrift --gen cpp thrift/Worker.thrift

gen_nodejs:
	thrift --gen js:node thrift/Worker.thrift

