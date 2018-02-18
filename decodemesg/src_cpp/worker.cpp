#include "../gen-cpp/Worker.h"

#include <thrift/protocol/TBinaryProtocol.h>
#include <thrift/transport/TSocket.h>
#include <thrift/transport/TTransportUtils.h>
#include <thrift/Thrift.h>

#include <cstdint>
#include <iostream>
#include <memory>
#include <string>
#include <vector>

using ::apache::thrift::TException;
using ::apache::thrift::transport::TSocket;
using ::apache::thrift::transport::TTransport;
using ::apache::thrift::transport::TBufferedTransport;
using ::apache::thrift::protocol::TBinaryProtocol;
using ::apache::thrift::protocol::TProtocol;

namespace {

static const char* const ENCYPTED_MESSAGE
  = "kbcwfxgutniyckfsbberfxioagdfomclihhugqbpixptsjvaiqqihlc";
static const int KEY_LENGTH = 8;
static const int RADIX = 26;
static const int STOP_COUNT = 4;

void toRadix(int64_t q, int radix, char shifts[KEY_LENGTH]) {
  for (int i = 0; i < KEY_LENGTH; ++i) {
    shifts[i] = 0;
  }
  int r = 0;
  int i = 0;
  while (true) {
    r = q % radix;
    shifts[i++] = r;
    q = (q - r) / radix;
    if (q == 0) {
      break;
    }
  }
}

bool testKey(int64_t n, std::string& result, unsigned int message_size) {
  result.clear();
  char shifts[KEY_LENGTH];
  toRadix(n, RADIX, shifts);
  for (unsigned int i = 0; i < message_size; ++i) {
    char value = (ENCYPTED_MESSAGE[i]
      - 'a' - shifts[i % KEY_LENGTH] + RADIX) % RADIX + 'a';
    result += value;
  }
  int count = 0;
  int pos = result.find("stop");
  while (pos > -1) {
    ++count;
    pos = result.find("stop", ++pos);
  }
  return count >= STOP_COUNT;
}

}  // namespace anonymous

int main(int argc, char **argv) {
  std::shared_ptr<TTransport> socket(new TSocket("localhost", 9090));
  std::shared_ptr<TTransport> transport(new TBufferedTransport(socket));
  std::shared_ptr<TProtocol> protocol(new TBinaryProtocol(transport));
  WorkerClient client(protocol);

  try {
    transport->open();
    std::string worker_id;
    client.login(worker_id);
    bool running = true;
    unsigned int message_size = strlen(ENCYPTED_MESSAGE);
    while (running) {
      WorkerRange range;
      client.reserve(range);
      std::cout << range.first << " " << range.last << std::endl;
      if (range.last == 0) {
        break;
      } else {
        std::vector<std::string> fibs_vector;
        std::string result;
        for (int64_t i = range.first; i <= range.last; ++i) {
          if (testKey(i, result, message_size)) {
            std::cout << i <<  " " << result << std::endl;
            fibs_vector.push_back(result);
          }
        }
        client.report(range, fibs_vector);
      }
    }
    client.logout(worker_id);
    transport->close();
  } catch (TException& tx) {
    std::cout << "ERROR: " << tx.what() << std::endl;
  }
  return 0;
}
